import { NextRequest } from "next/server";
import supabase from "./supabase";

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

export async function getAuthUser(
  req: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    // Try to get token from Authorization header (set by client-side Supabase)
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

    const { data, error } = token
      ? await supabase.auth.getUser(token)
      : await supabase.auth.getUser();

    if (error || !data?.user) {
      return null;
    }

    return {
      userId: data.user.id,
      email: data.user.email!,
    };
  } catch (err) {
    console.error("Auth error:", err);
    return null;
  }
}

export interface FactoryInfo {
  id: string;
}

export type UserFactoryResult =
  | { user: { id: string }; factory: FactoryInfo }
  | { error: string; status: number };

export async function getUserFactory(req?: NextRequest): Promise<UserFactoryResult> {
  let token: string | undefined;
  if (req) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  const {
    data: { user },
    error: authError,
  } = token
    ? await supabase.auth.getUser(token)
    : await supabase.auth.getUser();

  if (authError || !user) return { error: "Unauthorized", status: 401 };

  const { data: factory, error: factoryError } = await supabase
    .from("factories")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (factoryError) return { error: factoryError.message, status: 500 };
  if (!factory?.id)
    return { error: "No factory found for current user", status: 400 };

  return { user: { id: user.id }, factory: { id: factory.id } };
}
