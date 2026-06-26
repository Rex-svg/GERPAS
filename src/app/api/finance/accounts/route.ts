import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getFactoryContext } from "@/lib/factoryAuth";

const categorySchema = z.object({
  name: z.string().min(2),
  transaction_type: z.enum(["Expense", "Income"]),
});

const categoryUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).optional(),
  transaction_type: z.enum(["Expense", "Income"]).optional(),
});

  export async function GET(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const { data, error } = await context.supabase
    .from("transaction_categories")
    .select("*")
    .eq("factory_id", context.factoryId)
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ accounts: data ?? [] });
}

export async function POST(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  try {
    const body = await req.json();
    const payload = categorySchema.parse(body);
    const { data, error } = await context.supabase
      .from("transaction_categories")
      .insert({ ...payload, factory_id: context.factoryId })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ account: data }, { status: 201 });
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
    const update = categoryUpdateSchema.parse(body);
    const { id, ...payload } = update;

    const { data, error } = await context.supabase
      .from("transaction_categories")
      .update(payload)
      .eq("id", id)
      .eq("factory_id", context.factoryId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ account: data });
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
      return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    }

    const { error } = await context.supabase
      .from("transaction_categories")
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
