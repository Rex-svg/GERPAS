import supabase from "../../../../lib/supabase";
import { getUserFactory } from "@/lib/authServer";

type TxRowFromDb = {
  id: string;
  created_at: string;
  item_id: string;
  quantity: number;
  transaction_type: string;
  warehouse_id?: string | null;
  notes?: string | null;
  created_by?: string | null;
  inventory_items?: { name?: string; sku?: string };
  warehouses?: { name?: string };
};

export async function GET(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth)
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") || "50");
    const item = url.searchParams.get("item");
    const warehouse = url.searchParams.get("warehouse");
    const type = url.searchParams.get("type");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const buildQuery = (includeRelations: boolean) => {
      const select = includeRelations
        ? `id, created_at, item_id, quantity, transaction_type, warehouse_id, notes, created_by, inventory_items!inner(name, sku, factory_id), warehouses(name)`
        : `id, created_at, item_id, quantity, transaction_type, warehouse_id, notes, created_by`;

      let q = supabase
        .from("inventory_transactions")
        .select(select)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (includeRelations) {
        q = q.eq("inventory_items.factory_id", auth.factory.id);
      }

      if (item) q = q.eq("item_id", item);
      if (warehouse) q = q.eq("warehouse_id", warehouse);
      if (type) q = q.eq("transaction_type", type);
      if (from) q = q.gte("created_at", from);
      if (to) q = q.lte("created_at", to);

      return q;
    };

    let { data, error } = await buildQuery(true);
    if (error) {
      const fallback = await buildQuery(false);
      if (!fallback.error) {
        data = fallback.data;
        error = null;
      }
    }

    if (error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });

    const dbRows = (data || []) as unknown as TxRowFromDb[];
    const transactions = dbRows.map((tx) => ({
      ...tx,
      type: tx.transaction_type,
      qty: tx.quantity,
      item_name: tx.inventory_items?.name ?? tx.inventory_items?.sku ?? null,
      // Backwards-compatible fields used by other pages
      item: tx.inventory_items?.sku ?? tx.item_id,
      warehouse_name: tx.warehouses?.name ?? null,
      warehouse: tx.warehouses?.name ?? tx.warehouse_id ?? null,
    }));

    return new Response(JSON.stringify({ transactions }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth)
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const body = await req.json();

    const {
      item_id,
      warehouse_id,
      transaction_type,
      quantity,
      purchase_order_id,
      reference_order_id,
      notes,
      unit_cost,
      total_cost,
    } = body ?? {};

    if (!item_id) return new Response(JSON.stringify({ error: "item_id required" }), { status: 400 });
    if (!transaction_type)
      return new Response(JSON.stringify({ error: "transaction_type required" }), { status: 400 });
    if (typeof quantity !== "number" && typeof quantity !== "string")
      return new Response(JSON.stringify({ error: "quantity required" }), { status: 400 });

    const qtyNum = Number(quantity);
    if (!Number.isFinite(qtyNum) || qtyNum === 0)
      return new Response(JSON.stringify({ error: "quantity must be a non-zero number" }), { status: 400 });

    // Normalize optional cost fields to match schema defaults
    const unitCostNum = unit_cost === undefined || unit_cost === null ? 0 : Number(unit_cost);
    const totalCostNum = total_cost === undefined || total_cost === null ? 0 : Number(total_cost);

    const { data, error } = await supabase
      .from("inventory_transactions")
      .insert({
        item_id,
        warehouse_id: warehouse_id || null,
        transaction_type,
        quantity: qtyNum,
        purchase_order_id: purchase_order_id || null,
        reference_order_id: reference_order_id || null,
        notes: notes || null,
        created_by: auth.user.id,
        unit_cost: Number.isFinite(unitCostNum) ? unitCostNum : 0,
        total_cost: Number.isFinite(totalCostNum) ? totalCostNum : 0,
      })
      .select()
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

    return new Response(JSON.stringify({ transaction: data }), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

