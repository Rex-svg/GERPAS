import supabase from "../../../../../lib/supabase";
import { getUserFactory } from "@/lib/authServer";

export async function POST(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const body = await req.json();
    const { item_id, from_warehouse_id, to_warehouse_id, qty, notes } = body;
    if (!item_id || !from_warehouse_id || !to_warehouse_id || !qty) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

    const absQty = Math.abs(qty);

    const out = await supabase.from("inventory_transactions").insert({
      item_id,
      warehouse_id: from_warehouse_id,
      transaction_type: "TRANSFER_OUT",
      quantity: -absQty,
      notes: notes || null,
      created_by: auth.user.id,
    });

    if (out.error) return new Response(JSON.stringify({ error: out.error.message }), { status: 500 });

    const inp = await supabase.from("inventory_transactions").insert({
      item_id,
      warehouse_id: to_warehouse_id,
      transaction_type: "TRANSFER_IN",
      quantity: absQty,
      notes: notes || null,
      created_by: auth.user.id,
    });

    if (inp.error) return new Response(JSON.stringify({ error: inp.error.message }), { status: 500 });

    const { data: fromStock, error: fromError } = await supabase
      .from("inventory_stock")
      .select("id, quantity")
      .eq("item_id", item_id)
      .eq("warehouse_id", from_warehouse_id)
      .single();

    if (fromError || !fromStock) {
      return new Response(JSON.stringify({ error: "Source stock record not found" }), { status: 404 });
    }

    await supabase
      .from("inventory_stock")
      .update({ quantity: Number(fromStock.quantity) - absQty, updated_at: new Date().toISOString() })
      .eq("id", fromStock.id);

    const { data: toStock, error: toError } = await supabase
      .from("inventory_stock")
      .select("id, quantity")
      .eq("item_id", item_id)
      .eq("warehouse_id", to_warehouse_id)
      .single();

    if (toError || !toStock) {
      await supabase.from("inventory_stock").insert({
        item_id,
        warehouse_id: to_warehouse_id,
        quantity: absQty,
      });
    } else {
      await supabase
        .from("inventory_stock")
        .update({ quantity: Number(toStock.quantity) + absQty, updated_at: new Date().toISOString() })
        .eq("id", toStock.id);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
