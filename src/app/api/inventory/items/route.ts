import supabase from "../../../../lib/supabase";
import { getUserFactory } from "@/lib/authServer";

type InventoryStockRecord = {
  quantity: number;
  warehouse_id: string;
};

type InventoryItemRow = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  description: string | null;
  min_stock: number;
  is_active: boolean;
  updated_at: string;
  category_id: string | null;
  factory_id: string;
  inventory_stock?: InventoryStockRecord[];
};

export async function GET(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = Number(url.searchParams.get("page") || "1");
    const perPage = Number(url.searchParams.get("perPage") || "20");
    const category = url.searchParams.get("category");
    const warehouse = url.searchParams.get("warehouse");
    const lowStock = url.searchParams.get("lowStock") === "true";

    let query = supabase
      .from("inventory_items")
      .select(`
        id,
        sku,
        name,
        unit,
        description,
        min_stock,
        is_active,
        updated_at,
        category_id,
        factory_id,
        inventory_stock(quantity, warehouse_id)
      `)
      .eq("factory_id", auth.factory.id)
      .order("updated_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    if (category) query = query.eq("category_id", category);
    if (warehouse) query = query.eq("inventory_stock.warehouse_id", warehouse);

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error } = await query.range(from, to);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

    const items = (data || []).map((item: InventoryItemRow) => {
      const current_stock = (item.inventory_stock || []).reduce((sum, record) => sum + (Number(record.quantity) || 0), 0);
      return {
        ...item,
        current_stock,
        status: item.is_active ? "active" : "inactive",
      };
    });

    return new Response(JSON.stringify({ items: lowStock ? items.filter((item) => Number(item.current_stock) < Number(item.min_stock || 0)) : items }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const body = await req.json();

    const payload = {
      sku: body.sku,
      name: body.name,
      category_id: body.category_id || null,
      unit: body.unit || "pcs",
      description: body.description || null,
      min_stock: body.min_stock || 0,
      is_active: body.is_active !== undefined ? body.is_active : true,
      factory_id: auth.factory.id,
    };

    const { data, error } = await supabase.from("inventory_items").insert(payload).select();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ item: data?.[0] || null }), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
