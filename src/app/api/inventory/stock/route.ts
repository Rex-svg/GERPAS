import supabase from "../../../../lib/supabase";
import { getUserFactory } from "@/lib/authServer";

export async function GET() {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    // Stock doesn't have factory_id directly; scope via inventory_items factory_id
    const { data, error } = await supabase
      .from("inventory_stock")
      .select(`id, item_id, warehouse_id, quantity, updated_at, inventory_items!inner(id, sku, name, unit, min_stock, is_active, factory_id), warehouses(name)`)
      .eq("inventory_items.factory_id", auth.factory.id)
      .order("updated_at", { ascending: false });

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ stock: data || [] }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
