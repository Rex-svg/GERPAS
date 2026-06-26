import supabase from "../../../../lib/supabase";
import { getUserFactory } from "@/lib/authServer";

async function countRows(table: string, factoryId: string) {
  // Tables that have factory_id directly
  const tablesWithFactoryId = ["inventory_items", "inventory_categories", "warehouses", "suppliers", "fabric_rolls"];
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (tablesWithFactoryId.includes(table)) {
    query = query.eq("factory_id", factoryId);
  }
  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

export async function GET() {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const factoryId = auth.factory.id;

    const [stockResult, totalItems, totalCategories, totalWarehouses, totalSuppliers, pendingPurchaseOrders, fabricRolls] =
      await Promise.all([
        supabase
          .from("inventory_stock")
          .select("quantity, inventory_items!inner(min_stock, factory_id)")
          .eq("inventory_items.factory_id", factoryId),
        countRows("inventory_items", factoryId),
        countRows("inventory_categories", factoryId),
        countRows("warehouses", factoryId),
        countRows("suppliers", factoryId),
        (async () => {
          const { count, error } = await supabase
            .from("orders")
            .select("id", { count: "exact", head: true })
            .eq("status", "Pending")
            .eq("user_id", auth.user.id);
          if (error) return 0;
          return count ?? 0;
        })(),
        countRows("fabric_rolls", factoryId),
      ]);

    if (stockResult.error) {
      return new Response(JSON.stringify({ error: stockResult.error.message }), { status: 500 });
    }

    const stockRows = stockResult.data || [];
    const totalStockQuantity = stockRows.reduce((sum: number, item: { quantity: number }) => sum + (Number(item.quantity) || 0), 0);
    const lowStockCount = stockRows.filter((item) => Number(item.quantity) < Number(item.inventory_items?.[0]?.min_stock || 0)).length;

    return new Response(
      JSON.stringify({
        total_items: totalItems,
        total_categories: totalCategories,
        total_warehouses: totalWarehouses,
        total_suppliers: totalSuppliers,
        low_stock_count: lowStockCount,
        total_stock_quantity: totalStockQuantity,
        total_stock_value: totalStockQuantity,
        pending_purchase_orders: pendingPurchaseOrders,
        fabric_rolls: fabricRolls,
      }),
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message || "Failed to load overview" }), { status: 500 });
  }
}
