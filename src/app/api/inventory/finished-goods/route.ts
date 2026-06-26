import supabase from "../../../../lib/supabase";
import { getUserFactory } from "@/lib/authServer";

export async function GET() {
  try {
    const auth = await getUserFactory();
    if ("error" in auth)
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status,
      });

    // Fetch orders with status "QC" (finished production)
    const { data: qcOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, style_code, buyer_name, quantity, status, created_at")
      .eq("status", "QC")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (ordersError) {
      return new Response(JSON.stringify({ error: ordersError.message }), {
        status: 500,
      });
    }

    // Also fetch stock items for the full finished goods view
    const { data: stockItems, error: stockError } = await supabase
      .from("inventory_stock")
      .select(
        `id, item_id, warehouse_id, quantity, inventory_items!inner(id, sku, name), warehouses(name)`
      )
      .eq("inventory_items.factory_id", auth.factory.id)
      .gt("quantity", 0)
      .order("quantity", { ascending: false });

    if (stockError) {
      return new Response(JSON.stringify({ error: stockError.message }), {
        status: 500,
      });
    }

    // Format QC orders as finished goods
    const qcGoods = (qcOrders || []).map((order) => ({
      id: `qc-${order.id}`,
      sku: order.style_code || "—",
      name: `${order.buyer_name} — ${order.style_code || "Order"}`,
      warehouse_id: null as string | null,
      warehouse_name: "QC Completed",
      stock: order.quantity,
      order_id: order.id,
      source: "qc_order" as const,
    }));

    // Format warehouse stock as finished goods
    const stockGoods = (stockItems || []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      sku: (item.inventory_items as Record<string, unknown>)?.sku as string || "—",
      name: (item.inventory_items as Record<string, unknown>)?.name as string || "—",
      warehouse_id: item.warehouse_id as string | null,
      warehouse_name: (item.warehouses as Record<string, unknown>)?.name as string || "—",
      stock: item.quantity as number,
      order_id: null as string | null,
      source: "warehouse_stock" as const,
    }));

    return new Response(
      JSON.stringify({
        finished_goods: [...qcGoods, ...stockGoods],
        qc_orders_count: (qcOrders || []).length,
        stock_items_count: (stockItems || []).length,
      }),
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
