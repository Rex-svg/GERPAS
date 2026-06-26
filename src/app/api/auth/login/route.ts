import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Supabase authentication
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = data.user;

    // Fetch profile (ONLY if you need extra info like factory name)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("factory_name")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.warn("Profile fetch error:", profileError.message);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: profile?.factory_name ?? null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Login error:", error);
    return NextResponse.json(
      { error: message || "Login failed" },
      { status: 500 }
    );
  }
}