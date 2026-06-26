import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getFactoryContext } from "@/lib/factoryAuth";

/** Helper: get employee IDs belonging to the current factory */
async function getFactoryEmployeeIds(context: Awaited<ReturnType<typeof getFactoryContext>>): Promise<string[]> {
  if ("error" in context) return [];
  const { data: employees } = await context.supabase
    .from("employees")
    .select("id")
    .eq("factory_id", context.factoryId);
  return (employees ?? []).map((e: any) => e.id);
}

const normalizeMonthToDate = (value: string | undefined | null): string | undefined => {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
  return value;
};

const paymentSchema = z.object({
  employee_id: z.string().uuid().nullable().optional(),
  payment_month: z.string().min(7),
  basic_salary: z.number().nonnegative(),
  bonus: z.number().nonnegative().optional().default(0),
  deduction: z.number().nonnegative().optional().default(0),
  net_salary: z.number().nonnegative(),
  payment_date: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

const paymentUpdateSchema = z.object({
  id: z.string().uuid(),
  payment_month: z.string().min(7).optional(),
  basic_salary: z.number().nonnegative().optional(),
  bonus: z.number().nonnegative().optional(),
  deduction: z.number().nonnegative().optional(),
  net_salary: z.number().nonnegative().optional(),
  payment_date: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const id = url.searchParams.get("id");
  const page = Number(url.searchParams.get("page") || "1");
  const perPage = Number(url.searchParams.get("perPage") || "20");
  const start = (page - 1) * perPage;
  const end = start + perPage - 1;

  const employeeIds = await getFactoryEmployeeIds(context);

  let query = context.supabase
    .from("salary_payments")
    .select("*, employees(full_name, employee_code)")
    .in("employee_id", employeeIds.length > 0 ? employeeIds : ["00000000-0000-0000-0000-000000000000"])
    .order("payment_date", { ascending: false });

  if (id) query = query.eq("id", id);
  if (from) query = query.gte("payment_date", from);
  if (to) query = query.lte("payment_date", to);

  let { data, error } = await query.range(start, end);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map salary_payments to frontend-expected shape
  let payments = (data ?? []).map((sp: any) => ({
    id: sp.id,
    amount: Number(sp.net_salary),
    payment_method: "Bank Transfer",
    payment_status: "Paid",
    payment_date: sp.payment_date || sp.created_at?.slice(0, 10),
    created_at: sp.created_at,
    supplier_id: null,
    purchase_order_id: null,
    employee_id: sp.employee_id,
    employee: sp.employees,
  }));

  if (status && status !== "All") {
    payments = payments.filter((p: any) => p.payment_status === status);
  }

  return NextResponse.json({ payments });
}

export async function POST(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  try {
    const body = await req.json();
    const net_salary = Number(body.amount);
    const employeeId = body.employee_id || body.supplier_id || null;

    const mappedBody = {
      employee_id: employeeId,
      payment_month: normalizeMonthToDate(body.payment_date?.slice(0, 7) || new Date().toISOString().slice(0, 7)),
      basic_salary: net_salary,
      bonus: 0,
      deduction: 0,
      net_salary,
      payment_date: body.payment_date || null,
      remarks: body.notes || null,
    };

    const payload = paymentSchema.parse(mappedBody);

    // Verify employee belongs to factory before inserting
    if (payload.employee_id) {
      const employeeIds = await getFactoryEmployeeIds(context);
      if (!employeeIds.includes(payload.employee_id)) {
        return NextResponse.json({ error: "Employee not found in your factory" }, { status: 403 });
      }
    }

    const { data, error } = await context.supabase
      .from("salary_payments")
      .insert(payload)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const payment = {
      ...data,
      amount: Number(data.net_salary),
      payment_method: "Bank Transfer",
      payment_status: "Paid",
      payment_date: data.payment_date || data.created_at?.slice(0, 10),
    };

    return NextResponse.json({ payment }, { status: 201 });
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
      net_salary: body.amount || body.net_salary,
      payment_date: body.payment_date,
      remarks: body.notes || body.remarks,
    };
    const update = paymentUpdateSchema.parse(mappedBody);
    const { id, ...payload } = update;

    const employeeIds = await getFactoryEmployeeIds(context);

    const { data, error } = await context.supabase
      .from("salary_payments")
      .update(payload)
      .eq("id", id)
      .in("employee_id", employeeIds.length > 0 ? employeeIds : ["00000000-0000-0000-0000-000000000000"])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ payment: data });
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
    if (!id) return NextResponse.json({ error: "Payment id is required" }, { status: 400 });

    const employeeIds = await getFactoryEmployeeIds(context);

    const { error } = await context.supabase
      .from("salary_payments")
      .delete()
      .eq("id", id)
      .in("employee_id", employeeIds.length > 0 ? employeeIds : ["00000000-0000-0000-0000-000000000000"]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
