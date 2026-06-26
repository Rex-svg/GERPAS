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
      .from("fabric_rolls")
      .select()
      .eq("id", id)
      .eq("factory_id", auth.factory.id)
      .single();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ roll: data }), { status: 200 });
  } catch (err: unknown) { const message = err instanceof Error ? err.message : String(err); return new Response(JSON.stringify({ error: message }), { status: 500 }); }
}

export async function PUT(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });

    const body = await req.json();
    // Normalize received_date to received_at
    let receivedAt = body.received_at || body.received_date;
    if (receivedAt) {
      receivedAt = receivedAt.length === 10 ? `${receivedAt}T00:00:00Z` : receivedAt;
    }
    const updateBody: Record<string, unknown> = { ...body };
    delete updateBody.received_date;
    if (receivedAt) updateBody.received_at = receivedAt;

    const { data, error } = await supabase
      .from("fabric_rolls")
      .update(updateBody)
      .eq("id", id)
      .eq("factory_id", auth.factory.id)
      .select();
    if (error) {
      const message = error.message.includes("foreign key constraint")
        ? "Invalid item or warehouse selected."
        : error.message.includes("unique constraint")
          ? "A roll with this number already exists."
          : error.message;
      return new Response(JSON.stringify({ error: message }), { status: 400 });
    }
    return new Response(JSON.stringify({ roll: data?.[0] || null }), { status: 200 });
  } catch (err: unknown) { const message = err instanceof Error ? err.message : String(err); return new Response(JSON.stringify({ error: message }), { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });

    const { error } = await supabase
      .from("fabric_rolls")
      .delete()
      .eq("id", id)
      .eq("factory_id", auth.factory.id);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) { const message = err instanceof Error ? err.message : String(err); return new Response(JSON.stringify({ error: message }), { status: 500 }); }
}
