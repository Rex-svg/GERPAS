"use client";

import supabase from "@/lib/supabase";

/**
 * Makes an authenticated API request by automatically adding the Authorization header
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${session.access_token}`);

  return fetch(url, {
    ...options,
    headers,
  });
}
