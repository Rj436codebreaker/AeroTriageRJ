const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function syncTableRowToSupabase(
  table: string,
  row: Record<string, any>
): Promise<{ synced: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { synced: false, error: "Supabase keys not set in .env.local (local storage active)." };
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { synced: false, error: txt || `HTTP ${res.status}` };
    }
    return { synced: true };
  } catch (err: any) {
    return { synced: false, error: err?.message || "Network sync error" };
  }
}