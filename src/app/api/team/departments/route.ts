import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getFactoryContext } from "@/lib/factoryAuth";

const teamSchema = z.object({
  name: z.string().min(2),
  description: z.string().max(500).optional().nullable(),
});

const teamUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).optional(),
  description: z.string().max(500).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  let query = context.supabase
    .from("teams")
    .select("id,name,description,created_at")
    .eq("factory_id", context.factoryId)
    .order("created_at", { ascending: false });

  if (id) query = query.eq("id", id);

  const { data: teams, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: employees, error: employeeError } = await context.supabase
    .from("employees")
    .select("id,team_id")
    .eq("factory_id", context.factoryId);

  if (employeeError) {
    return NextResponse.json({ error: employeeError.message }, { status: 500 });
  }

  const counts = (employees ?? []).reduce((acc, employee) => {
    const tid = employee.team_id || "";
    acc[tid] = (acc[tid] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const results = (teams ?? []).map((team) => ({
    ...team,
    employee_count: counts[team.id] ?? 0,
  }));

  return NextResponse.json({ departments: results });
}

export async function POST(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  try {
    const body = await req.json();
    const payload = teamSchema.parse(body);
    const { data, error } = await context.supabase
      .from("teams")
      .insert({ ...payload, factory_id: context.factoryId })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ department: data }, { status: 201 });
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
    const update = teamUpdateSchema.parse(body);
    const { id, ...payload } = update;

    const { data, error } = await context.supabase
      .from("teams")
      .update(payload)
      .eq("id", id)
      .eq("factory_id", context.factoryId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ department: data });
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
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Team id is required" }, { status: 400 });
    }

    const { error } = await context.supabase
      .from("teams")
      .delete()
      .eq("id", body.id)
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
