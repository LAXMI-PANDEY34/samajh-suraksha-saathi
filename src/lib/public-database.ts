import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function publicDatabase(url: string | undefined, key: string | undefined) {
  if (!url || !key) throw new Error("Document history is temporarily unavailable.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}