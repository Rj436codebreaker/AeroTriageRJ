import { getActiveHospitalSession } from "./hospitalSession";
import { syncTableRowToSupabase } from "./supabaseClient";

export type DirectoryCategory = "staff" | "doctors" | "patients" | "nurses";

export interface DirectoryRecord {
  id: string;
  hospitalId: string;
  category: DirectoryCategory;
  name: string;
  mobile: string;
  email: string;
  password: string;
  roleOrWard: string;
  status?: string;
  latestNotes?: string;
  billAmount?: number;
  paidAmount?: number;
}

export interface ReceiptItem {
  receiptNo: string;
  hospitalId: string;
  patientId: string;
  patientName: string;
  date: string;
  service: string;
  amount: number;
  status: "Paid" | "Pending";
}

const STORAGE_KEY = "aerotriage_directory_v2";
const RECEIPT_KEY = "aerotriage_receipts_v2";

const DEFAULT_RECORDS: DirectoryRecord[] = [
  {
    id: "STF-101",
    hospitalId: "H2",
    category: "staff",
    name: "Vikramaditya Dubey",
    mobile: "9839011201",
    email: "vikram.staff@aerotriage.in",
    password: "STF@101Pass",
    roleOrWard: "Control Room Desk",
    status: "Active",
    latestNotes: "Shift A grid coordinator",
  },
  {
    id: "DOC-201",
    hospitalId: "H2",
    category: "doctors",
    name: "Dr. Ananya Verma",
    mobile: "9839022302",
    email: "dr.ananya@aerotriage.in",
    password: "DOC@201Pass",
    roleOrWard: "Emergency & Cardiology",
    status: "On Duty",
    latestNotes: "Triage lead - Lucknow Grid",
  },
  {
    id: "NUR-301",
    hospitalId: "H2",
    category: "nurses",
    name: "Pooja Tiwari",
    mobile: "9839033403",
    email: "pooja.nurse@aerotriage.in",
    password: "NUR@301Pass",
    roleOrWard: "Trauma & ICU Bay 2",
    status: "On Shift",
    latestNotes: "Vitals & observation monitoring",
  },
  {
    id: "PT-101",
    hospitalId: "H2",
    category: "patients",
    name: "Ramesh Kumar",
    mobile: "9839044504",
    email: "ramesh.pt@aerotriage.in",
    password: "PT@101Pass",
    roleOrWard: "Dr. RML Institute (RMLIMS) - Ward 4",
    status: "Monitored",
    latestNotes: "SpO2 96%, HR 84 bpm - vitals stabilizing",
    billAmount: 8500,
    paidAmount: 5000,
  },
  {
    id: "PT-102",
    hospitalId: "H3",
    category: "patients",
    name: "Sunita Devi",
    mobile: "9839055605",
    email: "sunita.pt@aerotriage.in",
    password: "PT@102Pass",
    roleOrWard: "Medanta Hospital - HDU 1",
    status: "Critical Watch",
    latestNotes: "Post-syncope observation & ECG check",
    billAmount: 14200,
    paidAmount: 14200,
  },
  {
    id: "PT-103",
    hospitalId: "H1",
    category: "patients",
    name: "Mahesh Chandra",
    mobile: "9839066706",
    email: "mahesh.pt@aerotriage.in",
    password: "PT@103Pass",
    roleOrWard: "Lari Cardiology Center (KGMU) - CCU 2",
    status: "Cardiac Watch",
    latestNotes: "Continuous ECG & Troponin follow-up",
    billAmount: 11000,
    paidAmount: 7000,
  },
];

const DEFAULT_RECEIPTS: ReceiptItem[] = [
  {
    receiptNo: "RCP-9001",
    hospitalId: "H2",
    patientId: "PT-101",
    patientName: "Ramesh Kumar",
    date: "2026-11-24",
    service: "Emergency Triage + ICU Monitoring",
    amount: 8500,
    status: "Pending",
  },
  {
    receiptNo: "RCP-9002",
    hospitalId: "H3",
    patientId: "PT-102",
    patientName: "Sunita Devi",
    date: "2026-11-24",
    service: "Cardiac Panel + Ambulance Transfer",
    amount: 14200,
    status: "Paid",
  },
];

export function loadDirectory(filterByActiveHospital = false): DirectoryRecord[] {
  let all = DEFAULT_RECORDS;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECORDS));
      } else {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) all = parsed;
      }
    } catch {}
  }

  if (filterByActiveHospital) {
    const session = getActiveHospitalSession();
    if (session) {
      const scoped = all.filter((r) => r.hospitalId === session.hospitalId);
      return scoped.length > 0 ? scoped : all;
    }
  }
  return all;
}

export function saveDirectory(records: DirectoryRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addDirectoryRecord(record: DirectoryRecord): DirectoryRecord[] {
  const current = loadDirectory(false);
  const updated = [record, ...current];
  saveDirectory(updated);
  void syncTableRowToSupabase("aerotriage_directory", {
    id: record.id,
    hospital_id: record.hospitalId,
    category: record.category,
    full_name: record.name,
    mobile: record.mobile,
    email: record.email,
    password_hash: record.password,
    role_or_ward: record.roleOrWard,
    status: record.status || "Active",
    latest_notes: record.latestNotes || "",
  });
  return updated;
}

export function findPatientById(patientId: string): DirectoryRecord | undefined {
  const cleanId = patientId.trim().toUpperCase();
  const session = getActiveHospitalSession();
  const list = loadDirectory(false);
  if (session) {
    const sameHospital = list.find(
      (r) =>
        r.category === "patients" &&
        r.hospitalId === session.hospitalId &&
        r.id.toUpperCase() === cleanId
    );
    if (sameHospital) return sameHospital;
  }
  return list.find(
    (r) => r.category === "patients" && r.id.toUpperCase() === cleanId
  );
}

export function findCredentialByIdOrEmail(identifier: string, password: string): DirectoryRecord | undefined {
  const q = identifier.trim().toLowerCase();
  const session = getActiveHospitalSession();
  return loadDirectory(false).find(
    (r) =>
      (!session || r.hospitalId === session.hospitalId) &&
      (r.id.toLowerCase() === q || r.email.toLowerCase() === q) &&
      r.password === password
  );
}

export function loadReceipts(): ReceiptItem[] {
  let all = DEFAULT_RECEIPTS;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(RECEIPT_KEY);
      if (!raw) {
        window.localStorage.setItem(RECEIPT_KEY, JSON.stringify(DEFAULT_RECEIPTS));
      } else {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) all = parsed;
      }
    } catch {}
  }
  const session = getActiveHospitalSession();
  if (session) {
    const scoped = all.filter((r) => r.hospitalId === session.hospitalId);
    return scoped.length > 0 ? scoped : all;
  }
  return all;
}

export function addReceipt(item: ReceiptItem): ReceiptItem[] {
  const current = loadReceipts();
  const updated = [item, ...current];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(RECEIPT_KEY, JSON.stringify(updated));
  }
  void syncTableRowToSupabase("aerotriage_receipts", {
    receipt_no: item.receiptNo,
    hospital_id: item.hospitalId,
    patient_id: item.patientId,
    patient_name: item.patientName,
    receipt_date: item.date,
    service: item.service,
    amount: item.amount,
    status: item.status,
  });
  return updated;
}