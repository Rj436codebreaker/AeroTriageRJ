export interface DoctorCareOrder {
  id: string;
  patientId: string;
  patientName: string;
  triageTier: string;
  nurseInstruction: string;
  recommendedMedications: string[];
  createdAt: string;
}

const ORDERS_KEY = "aerotriage_doctor_nurse_orders_v1";

export function buildClinicalRecommendations(params: {
  hr: number;
  sbp: number;
  spo2: number;
  troponin: number;
}): { nurseInstruction: string; medications: string[] } {
  const { hr, sbp, spo2, troponin } = params;
  const shockIndex = sbp > 0 ? hr / sbp : 0;
  const meds: string[] = [];
  const notes: string[] = [];

  if (spo2 < 92) {
    meds.push("Supplemental Oxygen Therapy (titrate to SpO2 >= 94%)");
    notes.push("Monitor continuous pulse oximetry and airway patency.");
  }
  if (sbp < 90 || shockIndex > 1.0) {
    meds.push("Isotonic IV Fluid Bolus (per doctor protocol & shock check)");
    notes.push("Check BP and Shock Index every 15 minutes; keep emergency tray ready.");
  }
  if (troponin > 0.04) {
    meds.push("12-Lead ECG + Cardiac Enzyme Serial Panel (as ordered by physician)");
    notes.push("Maintain strict bed rest and alert cardiology/ICU team immediately.");
  }
  if (hr > 110) {
    meds.push("Continuous Telemetry & Rhythm Strip Monitoring");
    notes.push("Watch for arrhythmia or sudden dizziness.");
  }

  if (meds.length === 0) {
    meds.push("Routine Supportive Hydration & Baseline Vitals Check");
    notes.push("Re-check vitals every 60 minutes and log patient comfort.");
  }

  return {
    nurseInstruction: notes.join(" "),
    medications: meds,
  };
}

export function loadCareOrders(): DoctorCareOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCareOrder(order: DoctorCareOrder): DoctorCareOrder[] {
  const current = loadCareOrders();
  const updated = [order, ...current];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  }
  return updated;
}