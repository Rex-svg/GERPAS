import supabase from "../../../../../lib/supabase";
import { getUserFactory } from "@/lib/authServer";

export async function GET(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });

    const { data, error } = await supabase
      .from("inventory_items")
      .select()
      .eq("id", id)
      .eq("factory_id", auth.factory.id)
      .single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ item: data }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });

    const body = await req.json();
    const { data, error } = await supabase
      .from("inventory_items")
      .update({
        sku: body.sku,
        name: body.name,
        category_id: body.category_id || null,
        unit: body.unit || "pcs",
        description: body.description || null,
        min_stock: body.min_stock || 0,
        is_active: body.is_active !== undefined ? body.is_active : true,
      })
      .eq("id", id)
      .eq("factory_id", auth.factory.id)
      .select();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ item: data?.[0] || null }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });

    const { error } = await supabase
      .from("inventory_items")
      .delete()
      .eq("id", id)
      .eq("factory_id", auth.factory.id);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

