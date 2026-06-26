import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getFactoryContext } from "@/lib/factoryAuth";

const normalizeMonthToDate = (value: string | undefined | null): string | undefined => {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
  return value;
};

const payrollSchema = z.object({
  employee_id: z.string().uuid(),
  payment_month: z.string().min(7),
  basic_salary: z.number().nonnegative(),
  bonus: z.number().nonnegative().optional().default(0),
  deduction: z.number().nonnegative().optional().default(0),
  payment_date: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

const payrollUpdateSchema = z.object({
  id: z.string().uuid(),
  payment_month: z.string().min(7).optional(),
  basic_salary: z.number().nonnegative().optional(),
  bonus: z.number().nonnegative().optional(),
  deduction: z.number().nonnegative().optional(),
  payment_date: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const url = new URL(req.url);
  const employeeId = url.searchParams.get("employee_id");
  const month = url.searchParams.get("month");
  const id = url.searchParams.get("id");
  const page = Number(url.searchParams.get("page") || "1");
  const perPage = Number(url.searchParams.get("perPage") || "20");
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = context.supabase
    .from("salary_payments")
    .select("*, employees!inner(factory_id, full_name, employee_code)")
    .eq("employees.factory_id", context.factoryId)
    .order("created_at", { ascending: false });

  if (id) query = query.eq("id", id);
  if (employeeId) query = query.eq("employee_id", employeeId);
  if (month) query = query.eq("payment_month", normalizeMonthToDate(month));

  const { data, error } = await query.range(from, to);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map salary_payments fields to match what frontend expects
  const payrolls = (data ?? []).map((sp: any) => ({
    ...sp,
    month: sp.payment_month,
    net_salary: Number(sp.net_salary),
    payment_status: "Paid",
    overtime: 0,
    employee: sp.employees,
  }));

  return NextResponse.json({ payrolls });
}

export async function POST(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  try {
    const body = await req.json();
    const mappedBody = {
      employee_id: body.employee_id,
      payment_month: normalizeMonthToDate(body.month || body.payment_month),
      basic_salary: body.basic_salary,
      bonus: body.bonus ?? body.overtime ?? 0,
      deduction: body.deduction ?? 0,
      payment_date: body.payment_date || null,
      remarks: body.remarks || null,
    };

    const payload = payrollSchema.parse(mappedBody);
    const net_salary = payload.basic_salary + payload.bonus - payload.deduction;

    const { data, error } = await context.supabase
      .from("salary_payments")
      .insert({
        ...payload,
        net_salary,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payroll: data }, { status: 201 });
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
    const mappedBody = {
      ...body,
      payment_month: normalizeMonthToDate(body.month || body.payment_month),
      bonus: body.bonus ?? body.overtime,
    };
    const update = payrollUpdateSchema.parse(mappedBody);
    const { id, ...payload } = update;

    const { data: existing } = await context.supabase
      .from("salary_payments")
      .select("basic_salary,bonus,deduction, employees!inner(factory_id)")
      .eq("id", id)
      .eq("employees.factory_id", context.factoryId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    const basic_salary = payload.basic_salary ?? existing.basic_salary;
    const bonus = payload.bonus ?? existing.bonus;
    const deduction = payload.deduction ?? existing.deduction;
    const net_salary = basic_salary + bonus - deduction;

    const { data, error } = await context.supabase
      .from("salary_payments")
      .update({ ...payload, net_salary })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payroll: data });
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
      return NextResponse.json({ error: "Payroll id is required" }, { status: 400 });
    }

    // Verify the record belongs to this factory before deleting
    const { data: record } = await context.supabase
      .from("salary_payments")
      .select("id, employees!inner(factory_id)")
      .eq("id", id)
      .eq("employees.factory_id", context.factoryId)
      .single();

    if (!record) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    const { error } = await context.supabase
      .from("salary_payments")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
