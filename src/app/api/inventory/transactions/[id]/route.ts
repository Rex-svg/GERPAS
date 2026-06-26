import supabase from "../../../../../lib/supabase";
import { getUserFactory } from "@/lib/authServer";

type TransactionDetail = {
  id: string;
  created_at: string;
  item_id: string;
  quantity: number;
  transaction_type: string;
  warehouse_id: string | null;
  notes: string | null;
  created_by: string | null;
  purchase_order_id: string | null;
  reference_order_id: string | null;
  unit_cost: number;
  total_cost: number;
  inventory_items?: { name?: string; sku?: string };
  warehouses?: { name?: string };
};

export async function GET(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth)
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });

    const { data, error } = await supabase
      .from("inventory_transactions")
      .select(
        `id, created_at, item_id, quantity, transaction_type, warehouse_id, notes, created_by, purchase_order_id, reference_order_id, unit_cost, total_cost, inventory_items!inner(name, sku, factory_id), warehouses(name)`
      )
      .eq("id", id)
      .eq("inventory_items.factory_id", auth.factory.id)
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

    return new Response(JSON.stringify({ transaction: data as TransactionDetail }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

