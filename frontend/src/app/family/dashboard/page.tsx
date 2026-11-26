"use client";

import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { DirectoryRecord, findPatientById } from "@/lib/directoryStore";

export default function FamilyDashboardPage() {
  const [patientId, setPatientId] = useState("PT-101");
  const [patient, setPatient] = useState<DirectoryRecord | undefined>(undefined);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const savedId =
      typeof window !== "undefined"
        ? (
            new URLSearchParams(window.location.search).get("id") ||
            window.localStorage.getItem("aerotriage_active_patient_id") ||
            "PT-101"
          )
            .trim()
            .toUpperCase()
        : "PT-101";

    setPatientId(savedId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("aerotriage_active_patient_id", savedId);
    }

    fetch(`${API_BASE_URL}/api/family/guidance`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const cleanId = patientId.trim().toUpperCase();
    if (!cleanId) {
      setPatient(undefined);
      return;
    }
    setPatient(findPatientById(cleanId));
    if (typeof window !== "undefined") {
      window.localStorage.setItem("aerotriage_active_patient_id", cleanId);
    }
  }, [patientId]);

  return (
    <main className="p-6 sm:p-8 max-w-4xl mx-auto space-y-5">
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-purple-300">Family Instant ID Portal</h1>
            <p className="text-xs text-slate-400">
              Showing isolated status strictly for Patient ID: <span className="font-mono text-white">{patientId || "—"}</span>
            </p>
          </div>
          <input
            value={patientId}
            onChange={(e) => setPatientId(e.target.value.toUpperCase())}
            placeholder="Enter Patient ID (e.g. PT-101)"
            className="glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none"
          />
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-xs sm:text-sm space-y-1">
          <p className="font-semibold text-white">
            Patient: {patient?.name || "Record Not Found"} ({patientId || "—"})
          </p>
          <p className="text-slate-300">
            Status: <strong className="text-emerald-300">{patient?.status || "Unavailable"}</strong> |{" "}
            Location: <span className="text-white">{patient?.roleOrWard || "Dr. RML Institute (RMLIMS)"}</span>
          </p>
          <p className="text-slate-300">
            Update: {patient?.latestNotes || "Enter a valid Patient ID assigned by the hospital to view live status."}
          </p>
        </div>

        {data?.emergency_protocol && (
          <div className="space-y-2 pt-1">
            <h2 className="text-sm font-bold text-purple-200">Quick Family Guidance</h2>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-200 space-y-1">
              {data.emergency_protocol.map((step: string, idx: number) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}