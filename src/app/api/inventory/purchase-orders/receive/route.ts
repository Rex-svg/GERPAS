import supabase from "../../../../../lib/supabase";
import { getUserFactory } from "@/lib/authServer";

export async function POST(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const body = await req.json();
    const item_id = body.item_id;
    const warehouse_id = body.warehouse_id;
    const qty = Number(body.qty);
    const notes = body.notes || null;
    const order_id = body.order_id || null;

    if (!item_id || !warehouse_id || !qty || Number.isNaN(qty) || qty <= 0) {
      return new Response(JSON.stringify({ error: "Missing or invalid fields: item_id, warehouse_id, qty" }), { status: 400 });
    }

    const { error: transactionError } = await supabase.from("inventory_transactions").insert({
      item_id,
      warehouse_id,
      transaction_type: "PURCHASE",
      quantity: qty,
      notes,
      created_by: auth.user.id,
      reference_order_id: order_id || null,
    });

    if (transactionError) {
      return new Response(JSON.stringify({ error: transactionError.message }), { status: 500 });
    }

    const { data, error: stockError } = await supabase
      .from("inventory_stock")
      .select("id, quantity")
      .eq("item_id", item_id)
      .eq("warehouse_id", warehouse_id)
      .single();

    if (stockError || !data) {
      await supabase.from("inventory_stock").insert({
        item_id,
        warehouse_id,
        quantity: qty,
      });
    } else {
      await supabase
        .from("inventory_stock")
        .update({ quantity: Number(data.quantity) + qty, updated_at: new Date().toISOString() })
        .eq("id", data.id);
    }

    if (order_id) {
      await supabase
        .from("orders")
        .update({ status: "Cutting" })
        .eq("id", order_id);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
