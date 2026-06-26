import supabase from "../../../../../lib/supabase";
import { getUserFactory } from "@/lib/authServer";

export async function POST(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const body = await req.json();
    const { item_id, warehouse_id, qty, type = "ADJUSTMENT", notes } = body;
    if (!item_id || !warehouse_id || typeof qty !== "number") return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

    const { error: txErr } = await supabase.from("inventory_transactions").insert({
      item_id,
      warehouse_id,
      transaction_type: type,
      quantity: qty,
      notes: notes || null,
      created_by: auth.user.id,
    });

    if (txErr) return new Response(JSON.stringify({ error: txErr.message }), { status: 500 });

    const { data, error: fetchError } = await supabase
      .from("inventory_stock")
      .select("id, quantity")
      .eq("item_id", item_id)
      .eq("warehouse_id", warehouse_id)
      .single();

    if (fetchError || !data) {
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

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
