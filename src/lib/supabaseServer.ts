import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

/**
 * Creates a Supabase client that uses HTTP cookies (via next/headers)
 * for auth session persistence on the server side.
 *
 * Call this inside Route Handlers, Server Components, or Server Actions
 * so that cookies() runs within the request context.
 */
export async function createServerSupabaseClient() {
  // Dynamically import cookies() so this module can be bundled safely
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      storage: {
        getItem(key: string) {
          return cookieStore.get(key)?.value ?? null;
        },
        setItem(key: string, value: string) {
          cookieStore.set(key, value);
        },
        removeItem(key: string) {
          cookieStore.delete(key);
        },
      },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}
