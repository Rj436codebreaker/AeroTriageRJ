import { syncTableRowToSupabase } from "./supabaseClient";

export interface HospitalServerAccount {
  hospitalId: string;
  hospitalName: string;
  address: string;
  serverCode: string;
  password: string;
}

export interface OwnerAuditEvent {
  id: string;
  timestamp: string;
  action: "SERVER_REGISTERED" | "SERVER_LOGIN" | "SERVER_DELETED";
  hospitalId: string;
  hospitalName: string;
  serverCode: string;
  detail: string;
}

const HOSPITALS_KEY = "aerotriage_hospital_accounts_v1";
const ACTIVE_SESSION_KEY = "aerotriage_active_hospital_session_v1";
const OWNER_AUTH_KEY = "aerotriage_owner_unlocked_v1";
const AUDIT_LOG_KEY = "aerotriage_owner_audit_log_v1";

// Aap is owner passcode ko apne hisaab se badal sakte hain
export const OWNER_PASSCODE =
  process.env.NEXT_PUBLIC_OWNER_PASSCODE || "RAJ@OWNER2026";

const DEFAULT_HOSPITALS: HospitalServerAccount[] = [
  {
    hospitalId: "H1",
    hospitalName: "Lari Cardiology Center (KGMU)",
    address: "Chowk, Lucknow",
    serverCode: "HOSP-KGMU-01",
    password: "KGMU@2026",
  },
  {
    hospitalId: "H2",
    hospitalName: "Dr. RML Institute (RMLIMS)",
    address: "Gomti Nagar, Lucknow",
    serverCode: "HOSP-RML-02",
    password: "RML@2026",
  },
  {
    hospitalId: "H3",
    hospitalName: "Medanta Hospital",
    address: "Shaheed Path, Lucknow",
    serverCode: "HOSP-MED-03",
    password: "MED@2026",
  },
];

function deduplicateHospitals(
  list: HospitalServerAccount[]
): HospitalServerAccount[] {
  const seen = new Set<string>();
  return list.filter((h) => {
    const key = `${h.hospitalId.trim().toUpperCase()}|${h.serverCode
      .trim()
      .toUpperCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function loadAuditHistory(): OwnerAuditEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AUDIT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordOwnerAuditEvent(
  event: Omit<OwnerAuditEvent, "id" | "timestamp">
): OwnerAuditEvent[] {
  const current = loadAuditHistory();
  const entry: OwnerAuditEvent = {
    ...event,
    id: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    timestamp: new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
  const updated = [entry, ...current].slice(0, 100);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function clearAuditHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUDIT_LOG_KEY);
}

export function isOwnerAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(OWNER_AUTH_KEY) === "true";
}

export function loginAsOwner(passcode: string): boolean {
  if (passcode.trim() !== OWNER_PASSCODE) return false;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(OWNER_AUTH_KEY, "true");
  }
  return true;
}

export function logoutOwner() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(OWNER_AUTH_KEY);
  }
}

export function loadHospitalAccounts(): HospitalServerAccount[] {
  if (typeof window === "undefined") return DEFAULT_HOSPITALS;
  try {
    const raw = window.localStorage.getItem(HOSPITALS_KEY);
    if (!raw) {
      window.localStorage.setItem(HOSPITALS_KEY, JSON.stringify(DEFAULT_HOSPITALS));
      return DEFAULT_HOSPITALS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const cleaned = deduplicateHospitals(parsed);
      window.localStorage.setItem(HOSPITALS_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
    return DEFAULT_HOSPITALS;
  } catch {
    return DEFAULT_HOSPITALS;
  }
}

export function registerHospitalServer(
  account: HospitalServerAccount
): HospitalServerAccount[] {
  const normalized: HospitalServerAccount = {
    hospitalId: account.hospitalId.trim().toUpperCase(),
    hospitalName: account.hospitalName.trim(),
    address: account.address.trim(),
    serverCode: account.serverCode.trim().toUpperCase(),
    password: account.password.trim(),
  };

  const current = loadHospitalAccounts().filter(
    (h) =>
      h.hospitalId.toUpperCase() !== normalized.hospitalId &&
      h.serverCode.toUpperCase() !== normalized.serverCode
  );
  const updated = [normalized, ...current];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HOSPITALS_KEY, JSON.stringify(updated));
  }

  recordOwnerAuditEvent({
    action: "SERVER_REGISTERED",
    hospitalId: normalized.hospitalId,
    hospitalName: normalized.hospitalName,
    serverCode: normalized.serverCode,
    detail: `Registered (${normalized.address})`,
  });

  void syncTableRowToSupabase("aerotriage_hospitals", {
    id: normalized.hospitalId,
    name: normalized.hospitalName,
    address: normalized.address,
    server_code: normalized.serverCode,
    password_hash: normalized.password,
  });

  return updated;
}

export function loginHospitalServer(
  serverCode: string,
  password: string
): HospitalServerAccount | null {
  const code = serverCode.trim().toUpperCase();
  const found = loadHospitalAccounts().find(
    (h) => h.serverCode.toUpperCase() === code && h.password === password
  );
  if (found && typeof window !== "undefined") {
    window.localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(found));
    recordOwnerAuditEvent({
      action: "SERVER_LOGIN",
      hospitalId: found.hospitalId,
      hospitalName: found.hospitalName,
      serverCode: found.serverCode,
      detail: "Authenticated hospital server session",
    });
  }
  return found || null;
}

export function getActiveHospitalSession(): HospitalServerAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logoutHospitalServer() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_SESSION_KEY);
}

export async function deleteHospitalServer(
  hospitalId: string,
  serverCode?: string
): Promise<HospitalServerAccount[]> {
  const targetId = hospitalId.trim().toUpperCase();
  const targetCode = (serverCode || "").trim().toUpperCase();

  const existingList = loadHospitalAccounts();
  const targetAccount = existingList.find(
    (h) =>
      h.hospitalId.trim().toUpperCase() === targetId ||
      (targetCode && h.serverCode.trim().toUpperCase() === targetCode)
  );

  const remaining = existingList.filter((h) => {
    const matchId = h.hospitalId.trim().toUpperCase() === targetId;
    const matchCode =
      targetCode && h.serverCode.trim().toUpperCase() === targetCode;
    return !(matchId || matchCode);
  });

  if (typeof window !== "undefined") {
    window.localStorage.setItem(HOSPITALS_KEY, JSON.stringify(remaining));

    const active = getActiveHospitalSession();
    if (
      active &&
      (active.hospitalId.trim().toUpperCase() === targetId ||
        (targetCode && active.serverCode.trim().toUpperCase() === targetCode))
    ) {
      window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }

  recordOwnerAuditEvent({
    action: "SERVER_DELETED",
    hospitalId: targetId,
    hospitalName: targetAccount?.hospitalName || targetId,
    serverCode: targetAccount?.serverCode || targetCode || "-",
    detail: "Removed from local storage & Supabase aerotriage_hospitals",
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (supabaseUrl && supabaseAnonKey) {
    try {
      await fetch(
        `${supabaseUrl}/rest/v1/aerotriage_hospitals?id=eq.${encodeURIComponent(
          targetId
        )}`,
        {
          method: "DELETE",
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch {
      // Ignore network failure after local cleanup
    }
  }

  return remaining;
}