import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getFactoryContext } from "@/lib/factoryAuth";

const expenseSchema = z.object({
  category: z.string().min(2),
  amount: z.number().nonnegative(),
  notes: z.string().max(500).optional().nullable(),
  transaction_date: z.string().min(10),
  created_by: z.string().uuid().optional().nullable(),
});

const expenseUpdateSchema = z.object({
  id: z.string().uuid(),
  category: z.string().min(2).optional(),
  amount: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional().nullable(),
  transaction_date: z.string().min(10).optional(),
});

export async function GET(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const id = url.searchParams.get("id");
  const page = Number(url.searchParams.get("page") || "1");
  const perPage = Number(url.searchParams.get("perPage") || "20");
  const start = (page - 1) * perPage;
  const end = start + perPage - 1;

  let query = context.supabase
    .from("financial_transactions")
    .select("*")
    .eq("factory_id", context.factoryId)
    .eq("transaction_type", "Expense")
    .order("transaction_date", { ascending: false });

  if (id) query = query.eq("id", id);
  if (category) query = query.eq("category", category);
  if (from) query = query.gte("transaction_date", from);
  if (to) query = query.lte("transaction_date", to);

  const { data, error } = await query.range(start, end);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map to frontend-expected shape (expense_date, description, payment_method)
  const expenses = (data ?? []).map((ft: any) => ({
    ...ft,
    expense_date: ft.transaction_date,
    description: ft.notes,
    payment_method: "Bank Transfer",
  }));

  return NextResponse.json({ expenses });
}

export async function POST(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  try {
    const body = await req.json();
    // Map frontend fields to actual DB schema
    const mappedBody = {
      category: body.category,
      amount: body.amount,
      notes: body.description || body.notes || null,
      transaction_date: body.expense_date || body.transaction_date,
      created_by: context.userId,
    };

    const payload = expenseSchema.parse(mappedBody);
    const { data, error } = await context.supabase
      .from("financial_transactions")
      .insert({
        ...payload,
        transaction_type: "Expense",
        factory_id: context.factoryId,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Map response back to frontend shape
    const expense = {
      ...data,
      expense_date: data.transaction_date,
      description: data.notes,
      payment_method: "Bank Transfer",
    };

    return NextResponse.json({ expense }, { status: 201 });
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
      notes: body.description || body.notes,
      transaction_date: body.expense_date || body.transaction_date,
    };
    const update = expenseUpdateSchema.parse(mappedBody);
    const { id, ...payload } = update;

    const { data, error } = await context.supabase
      .from("financial_transactions")
      .update(payload)
      .eq("id", id)
      .eq("factory_id", context.factoryId)
      .eq("transaction_type", "Expense")
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ expense: data });
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
    if (!id) return NextResponse.json({ error: "Expense id is required" }, { status: 400 });

    const { error } = await context.supabase
      .from("financial_transactions")
      .delete()
      .eq("id", id)
      .eq("factory_id", context.factoryId)
      .eq("transaction_type", "Expense");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
