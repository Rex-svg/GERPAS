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
      .from("inventory_categories")
      .select()
      .eq("id", id)
      .eq("factory_id", auth.factory.id)
      .single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ category: data }), { status: 200 });
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
    if (!body.name) return new Response(JSON.stringify({ error: "Name required" }), { status: 400 });

    const { data, error } = await supabase
      .from("inventory_categories")
      .update({ name: body.name, description: body.description || null })
      .eq("id", id)
      .eq("factory_id", auth.factory.id)
      .select();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ category: data?.[0] || null }), { status: 200 });
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
      .from("inventory_categories")
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
