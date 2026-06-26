import supabase from "../../../../lib/supabase";
import { getUserFactory } from "@/lib/authServer";

export async function GET() {
  try {
    const auth = await getUserFactory();
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const { data, error } = await supabase
      .from("fabric_rolls")
      .select(`id, roll_number, item_id, warehouse_id, color, gsm, width, quantity_meters, received_at, inventory_items(name)`)
      .eq("factory_id", auth.factory.id)
      .order("received_at", { ascending: false });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ rolls: data || [] }), { status: 200 });
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

    if (!body.item_id) {
      return new Response(JSON.stringify({ error: "Item is required" }), { status: 400 });
    }

    // Accept both received_at and received_date (frontend compat)
    let receivedAt = body.received_at || body.received_date;
    if (receivedAt) {
      // If it's a date-only string (YYYY-MM-DD), ensure it's parsed as ISO
      receivedAt = receivedAt.length === 10 ? `${receivedAt}T00:00:00Z` : receivedAt;
    } else {
      receivedAt = new Date().toISOString();
    }

    const payload = {
      roll_number: body.roll_number || null,
      item_id: body.item_id,
      warehouse_id: body.warehouse_id || null,
      color: body.color || null,
      gsm: body.gsm || null,
      width: body.width || null,
      quantity_meters: body.quantity_meters || 0,
      received_at: receivedAt,
      factory_id: auth.factory.id,
    };
    const { data, error } = await supabase.from("fabric_rolls").insert(payload).select();
    if (error) {
      const message = error.message.includes("foreign key constraint")
        ? "Invalid item or warehouse selected. Please check your selection."
        : error.message.includes("unique constraint")
          ? "A roll with this number already exists."
          : error.message;
      return new Response(JSON.stringify({ error: message }), { status: 400 });
    }
    return new Response(JSON.stringify({ roll: data?.[0] || null }), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

