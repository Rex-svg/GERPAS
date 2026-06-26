import supabase from "../../../../lib/supabase";
import { getUserFactory } from "@/lib/authServer";

export async function GET() {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const { data, error } = await supabase
      .from("warehouses")
      .select()
      .eq("factory_id", auth.factory.id)
      .order("name");
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ warehouses: data || [] }), { status: 200 });
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
    if (!body.name) return new Response(JSON.stringify({ error: "Name required" }), { status: 400 });

    const { data, error } = await supabase
      .from("warehouses")
      .insert({ name: body.name, address: body.address || null, factory_id: auth.factory.id })
      .select();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ warehouse: data?.[0] || null }), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
