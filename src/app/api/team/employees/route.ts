import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getFactoryContext } from "@/lib/factoryAuth";

const employeeSchema = z.object({
  team_id: z.string().uuid().nullable().optional(),
  employee_code: z.string().min(2),
  full_name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(6).optional().nullable(),
  designation: z.string().min(2).optional().nullable(),
  monthly_salary: z.number().nonnegative(),
  joining_date: z.string().min(10),
  status: z.enum(["Active", "Inactive"]).optional(),
});

const updateEmployeeSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid().nullable().optional(),
  employee_code: z.string().min(2).optional(),
  full_name: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(6).optional().nullable(),
  designation: z.string().min(2).optional().nullable(),
  monthly_salary: z.number().nonnegative().optional(),
  joining_date: z.string().min(10).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
});

export async function GET(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const teamId = url.searchParams.get("team");
  const status = url.searchParams.get("status");
  const id = url.searchParams.get("id");
  const page = Number(url.searchParams.get("page") || "1");
  const perPage = Number(url.searchParams.get("perPage") || "20");
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = context.supabase
    .from("employees")
    .select("*, teams(name)")
    .eq("factory_id", context.factoryId)
    .order("created_at", { ascending: false });

  if (id) query = query.eq("id", id);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,employee_code.ilike.%${search}%`);
  }

  if (teamId) query = query.eq("team_id", teamId);
  if (status) query = query.eq("status", status);

  const { data, error } = await query.range(from, to);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map response: rename team_id → department_id, monthly_salary → salary, teams.name → departments.name
  const employees = (data ?? []).map((emp: any) => ({
    ...emp,
    department_id: emp.team_id,
    salary: emp.monthly_salary,
    departments: emp.teams ? { name: emp.teams.name } : undefined,
  }));

  return NextResponse.json({ employees });
}

export async function POST(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  try {
    const body = await req.json();
    // Map incoming fields from frontend (department_id→team_id, salary→monthly_salary)
    const { department_id, salary, ...rest } = body;
    const mappedBody = {
      ...rest,
      team_id: department_id ?? body.team_id ?? null,
      monthly_salary: salary ?? body.monthly_salary ?? 0,
    };

    const payload = employeeSchema.parse(mappedBody);
    const { data, error } = await context.supabase
      .from("employees")
      .insert({
        ...payload,
        factory_id: context.factoryId,
        status: payload.status ?? "Active",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ employee: data }, { status: 201 });
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
    // Map incoming fields
    const { department_id, salary, ...rest } = body;
    const mappedBody = {
      ...rest,
      team_id: department_id ?? body.team_id,
      monthly_salary: salary ?? body.monthly_salary,
    };

    const update = updateEmployeeSchema.parse(mappedBody);
    const { id, ...payload } = update;

    const { data, error } = await context.supabase
      .from("employees")
      .update(payload)
      .eq("id", id)
      .eq("factory_id", context.factoryId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ employee: data });
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
      return NextResponse.json({ error: "Employee id is required" }, { status: 400 });
    }

    const { error } = await context.supabase
      .from("employees")
      .delete()
      .eq("id", id)
      .eq("factory_id", context.factoryId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
