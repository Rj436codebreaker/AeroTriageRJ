import { syncTableRowToSupabase } from "./supabaseClient";

export interface HospitalServerAccount {
  hospitalId: string;
  hospitalName: string;
  address: string;
  serverCode: string;
  password: string;
}

const HOSPITALS_KEY = "aerotriage_hospital_accounts_v1";
const ACTIVE_SESSION_KEY = "aerotriage_active_hospital_session_v1";

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

export function loadHospitalAccounts(): HospitalServerAccount[] {
  if (typeof window === "undefined") return DEFAULT_HOSPITALS;
  try {
    const raw = window.localStorage.getItem(HOSPITALS_KEY);
    if (!raw) {
      window.localStorage.setItem(HOSPITALS_KEY, JSON.stringify(DEFAULT_HOSPITALS));
      return DEFAULT_HOSPITALS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HOSPITALS;
  } catch {
    return DEFAULT_HOSPITALS;
  }
}

export function registerHospitalServer(account: HospitalServerAccount): HospitalServerAccount[] {
  const current = loadHospitalAccounts();
  const updated = [account, ...current];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HOSPITALS_KEY, JSON.stringify(updated));
  }
  void syncTableRowToSupabase("aerotriage_hospitals", {
    id: account.hospitalId,
    name: account.hospitalName,
    address: account.address,
    server_code: account.serverCode,
    password_hash: account.password,
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