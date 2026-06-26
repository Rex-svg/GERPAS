import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user from Supabase session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(req.headers.get("Authorization")?.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch profile from DB
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, factory_name, email, role, created_at")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email ?? user.email,
        factoryName: profile.factory_name,
        role: profile.role,
        createdAt: profile.created_at,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Auth check error:", error);

    return NextResponse.json(
      { error: message || "Authentication failed" },
      { status: 500 }
    );
  }
}