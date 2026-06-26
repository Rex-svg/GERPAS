import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password, factoryName } = await req.json();

    // Validation
    if (!email || !password || !factoryName) {
      return NextResponse.json(
        { error: "Email, password, and factory name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 1. Create Supabase Auth user
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (signUpError || !signUpData.user) {
      return NextResponse.json(
        { error: signUpError?.message || "Signup failed" },
        { status: 400 }
      );
    }

    const user = signUpData.user;

    // 2. Create profile in database
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        factory_name: factoryName,
        email: user.email,
        role: "admin",
      });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // 3. Return response (NO COOKIE, NO JWT)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          factoryName,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Register error:", error);

    return NextResponse.json(
      { error: message || "Registration failed" },
      { status: 500 }
    );
  }
}