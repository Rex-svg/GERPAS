import { createServerSupabaseClient } from "@/lib/supabaseServer";
import supabase from "@/lib/supabase";
import { NextRequest } from "next/server";

export interface FactoryContext {
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  userId: string;
  factoryId: string;
}

export async function getFactoryContext(req?: NextRequest) {
  let user = null;
  let authError = null;

  // Try to get user from Authorization header first (for client-side requests)
  if (req) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const result = await supabase.auth.getUser(token);
      user = result.data.user;
      authError = result.error;
    }
  }

  // Fall back to server-side session (from cookies)
  if (!user) {
    const serverSupabase = await createServerSupabaseClient();
    const result = await serverSupabase.auth.getUser();
    user = result.data.user;
    authError = result.error;
  }

  if (authError || !user) {
    return { error: "Unauthorized", status: 401 };
  }

  const serverSupabase = await createServerSupabaseClient();
  const { data: factory, error: factoryError } = await serverSupabase
    .from("factories")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (factoryError) {
    return { error: factoryError.message, status: 500 };
  }

  if (!factory?.id) {
    return { error: "No factory found for current user", status: 400 };
  }

  return {
    supabase: serverSupabase,
    userId: user.id,
    factoryId: factory.id,
  };
}
