import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import supabase from "@/lib/supabase";

async function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (token) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  }

  const serverSupabase = await createServerSupabaseClient();
  const { data, error } = await serverSupabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * POST: Create factory for logged-in user (from onboarding)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: "Factory name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("factories")
      .insert({
        user_id: user.id,
        name: body.name,
        email: user.email,
        address: body.address || null,
        city: body.city || null,
        country: body.country || null,
        phone: body.phone || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ factory: data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * GET: Fetch factory for logged-in user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseClient = await createServerSupabaseClient();
    const { data, error } = await supabaseClient
      .from("factories")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(); // ✅ SAFE (prevents crash)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      factory: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update factory (NO EMAIL EDIT)
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const body = await req.json();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("factories")
      .update({
        name: body.name,
        address: body.address,
        city: body.city,
        country: body.country,
        phone: body.phone,
        subscription_plan: body.subscription_plan,
      })
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      factory: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}