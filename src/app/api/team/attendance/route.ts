import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getFactoryContext } from "@/lib/factoryAuth";

function normalizeTimeValue(attendanceDate: string | undefined, value?: string | null): string | null {
  if (!value) return null;

  const timeOnly = /^\d{2}:\d{2}$/.test(value);
  const timeWithSeconds = /^\d{2}:\d{2}:\d{2}$/.test(value);
  if (!attendanceDate || (!timeOnly && !timeWithSeconds)) {
    return value;
  }

  const normalizedTime = timeOnly ? `${value}:00` : value;
  return `${attendanceDate} ${normalizedTime}`;
}

const attendanceSchema = z.object({
  employee_id: z.string().uuid(),
  attendance_date: z.string().min(10),
  check_in: z.string().optional().nullable(),
  check_out: z.string().optional().nullable(),
  total_hours: z.number().nonnegative().optional().nullable(),
  status: z.enum(["Present", "Absent", "Late", "On Leave"]),
});

const attendanceUpdateSchema = z.object({
  id: z.string().uuid(),
  attendance_date: z.string().min(10).optional(),
  check_in: z.string().optional().nullable(),
  check_out: z.string().optional().nullable(),
  total_hours: z.number().nonnegative().optional().nullable(),
  status: z.enum(["Present", "Absent", "Late", "On Leave"]).optional(),
});

function normalizeDateFilter(value: string | null, endOfMonth = false): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    if (endOfMonth) {
      const lastDay = new Date(year, month, 0).getDate();
      return `${value}-${String(lastDay).padStart(2, "0")}`;
    }
    return `${value}-01`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return null;
}

function normalizeAttendanceRecord(record: any) {
  if (record?.employees) {
    record.employee = Array.isArray(record.employees) ? record.employees[0] : record.employees;
    delete record.employees;
  }
  return record;
}

export async function GET(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const url = new URL(req.url);
  const employeeId = url.searchParams.get("employee_id");
  const id = url.searchParams.get("id");
  const fromDate = normalizeDateFilter(url.searchParams.get("from"), false);
  const toDate = normalizeDateFilter(url.searchParams.get("to"), true);
  const page = Number(url.searchParams.get("page") || "1");
  const perPage = Number(url.searchParams.get("perPage") || "20");
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = context.supabase
    .from("employee_attendance")
    .select(`*, employees!inner(factory_id, full_name, designation)`)
    .eq("employees.factory_id", context.factoryId)
    .order("attendance_date", { ascending: false });

  if (id) query = query.eq("id", id);
  if (employeeId) query = query.eq("employee_id", employeeId);
  if (fromDate) query = query.gte("attendance_date", fromDate);
  if (toDate) query = query.lte("attendance_date", toDate);

  const { data, error } = await query.range(from, to);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attendance: (data ?? []).map(normalizeAttendanceRecord) });
}

export async function POST(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  try {
    const body = await req.json();
    const records = Array.isArray(body.records) ? body.records : [body];
    const parsed: z.infer<typeof attendanceSchema>[] = records.map((record: any) => {
      const normalized = attendanceSchema.parse(record);
      return {
        ...normalized,
        check_in: normalizeTimeValue(normalized.attendance_date, normalized.check_in),
        check_out: normalizeTimeValue(normalized.attendance_date, normalized.check_out),
      };
    });

    // Verify all employees belong to this factory
    const employeeIds = [...new Set(parsed.map(r => r.employee_id))];
    const { data: validEmployees } = await context.supabase
      .from("employees")
      .select("id")
      .in("id", employeeIds)
      .eq("factory_id", context.factoryId);

    if (!validEmployees || validEmployees.length !== employeeIds.length) {
      return NextResponse.json({ error: "Some employees do not belong to this factory" }, { status: 403 });
    }

    const { data, error } = await context.supabase
      .from("employee_attendance")
      .insert(parsed)
      .select(`*, employees!inner(factory_id, full_name, designation)`);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ attendance: (data ?? []).map(normalizeAttendanceRecord) }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  try {
    const body = await req.json();
    const update = attendanceUpdateSchema.parse(body);
    const { id, ...payload } = update;

    let attendanceDate = update.attendance_date;
    if (!attendanceDate && (update.check_in || update.check_out)) {
      const { data: existing, error: fetchError } = await context.supabase
        .from("employee_attendance")
        .select("attendance_date")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        return NextResponse.json({ error: "Attendance record not found in this factory" }, { status: 404 });
      }

      attendanceDate = existing.attendance_date;
    }

    const normalizedPayload = {
      ...payload,
      check_in: normalizeTimeValue(attendanceDate, update.check_in),
      check_out: normalizeTimeValue(attendanceDate, update.check_out),
    };

    const { data, error } = await context.supabase
      .from("employee_attendance")
      .update(normalizedPayload)
      .eq("id", id)
      .select(`*, employees!inner(factory_id, full_name, designation)`)
      .eq("employees.factory_id", context.factoryId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Attendance record not found in this factory" }, { status: 404 });
    }

    return NextResponse.json({ attendance: normalizeAttendanceRecord(data) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Attendance id is required" }, { status: 400 });
    }

    const { error } = await context.supabase
      .from("employee_attendance")
      .delete()
      .eq("id", id)
      .select(`id, employees!inner(factory_id)`)
      .eq("employees.factory_id", context.factoryId)
      .single();

    if (error) {
      return NextResponse.json({ error: "Attendance record not found in this factory" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
