"use client";

import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import CompactPatientBar from "@/components/CompactPatientBar";

export default function AmbulanceDashboardPage() {
  const [ambCode, setAmbCode] = useState("UP32-AMB-09");
  const [hospId, setHospId] = useState("H2");
  const [patientRef, setPatientRef] = useState("PT-101");
  const [dispatches, setDispatches] = useState<any[]>([]);

  async function loadDispatches() {
    const res = await fetch(`${API_BASE_URL}/api/ambulances/dispatches`);
    if (res.ok) setDispatches(await res.json());
  }

  useEffect(() => {
    loadDispatches();
  }, []);

  async function triggerDispatch(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`${API_BASE_URL}/api/ambulances/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ambulance_code: ambCode,
        hospital_id: hospId,
        patient_ref: patientRef,
      }),
    });
    loadDispatches();
  }

  return (
    <main className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h1 className="text-2xl font-bold text-amber-300">Ambulance Dispatch Desk</h1>
        <CompactPatientBar defaultPatientId={patientRef} onSelectPatient={setPatientRef} />
        <form onSubmit={triggerDispatch} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={ambCode} onChange={(e) => setAmbCode(e.target.value)} className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <input value={hospId} onChange={(e) => setHospId(e.target.value)} className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <input value={patientRef} onChange={(e) => setPatientRef(e.target.value)} className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <button type="submit" className="md:col-span-3 rounded-xl bg-amber-400/90 hover:bg-amber-300 text-slate-950 font-bold py-2.5 text-sm transition">
            Confirm Dispatch
          </button>
        </form>
      </div>

      <div className="space-y-2.5">
        {dispatches.map((d, i) => (
          <div key={i} className="glass-card p-4 rounded-xl text-sm flex justify-between items-center">
            <span>
              <strong className="text-white">{d.ambulance_code}</strong> to {d.hospital_id} ({d.patient_ref})
            </span>
            <span className="text-emerald-300 font-semibold">{d.status}</span>
          </div>
        ))}
      </div>
    </main>
  );
}