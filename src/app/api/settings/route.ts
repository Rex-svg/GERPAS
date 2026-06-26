import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET() {
  try {
    // Get active factory (ERP-safe approach)
    const { data, error } = await supabase
      .from("factories")
      .select(
        "id, name, email, phone, address, city, country, subscription_plan, subscription_status"
      )
      .limit(1)
      .single();

    if (error) throw error;

    // Normalize ERP settings format
    const settings = {
      factory_name: data?.name || "Factory Name",
      email: data?.email || "-",
      phone: data?.phone || "-",
      address: formatAddress(data),
      city: data?.city || "-",
      country: data?.country || "-",
      subscription_plan: data?.subscription_plan,
      subscription_status: data?.subscription_status,
    };

    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch factory settings";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// 🔥 Helper: clean ERP-style address formatting
function formatAddress(factory: { address?: string; city?: string; country?: string } | null | undefined) {
  const parts = [
    factory?.address,
    factory?.city,
    factory?.country,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "-";
}