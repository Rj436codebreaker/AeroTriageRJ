"use client";

import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import CompactPatientBar from "@/components/CompactPatientBar";
import { DoctorCareOrder, loadCareOrders } from "@/lib/careOrdersStore";

export default function NurseDashboardPage() {
  const [patientId, setPatientId] = useState("PT-101");
  const [note, setNote] = useState("");
  const [spo2, setSpo2] = useState(96);
  const [hr, setHr] = useState(84);
  const [logs, setLogs] = useState<any[]>([]);
  const [doctorOrders, setDoctorOrders] = useState<DoctorCareOrder[]>([]);

  async function loadLogs() {
    const res = await fetch(`${API_BASE_URL}/api/nurses/observations`);
    if (res.ok) setLogs(await res.json());
  }

  useEffect(() => {
    loadLogs();
    setDoctorOrders(loadCareOrders());
  }, []);

  async function submitLog(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`${API_BASE_URL}/api/nurses/observations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patientId,
        note,
        spo2: Number(spo2),
        hr: Number(hr),
      }),
    });
    setNote("");
    loadLogs();
  }

  return (
    <main className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h1 className="text-2xl font-bold text-teal-300">Nurse Care & Vitals Desk</h1>
        <CompactPatientBar defaultPatientId={patientId} onSelectPatient={setPatientId} />

        {doctorOrders.length > 0 && (
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-sky-300 uppercase tracking-wider">
              Doctor Orders & Recommended Medications
            </h2>
            {doctorOrders.map((ord) => (
              <div key={ord.id} className="glass-card rounded-xl p-4 space-y-1.5 text-xs sm:text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <strong className="text-white">
                    {ord.patientName} ({ord.patientId}) — {ord.triageTier}
                  </strong>
                  <span className="text-slate-300">{ord.createdAt}</span>
                </div>
                <p className="text-slate-200">{ord.nurseInstruction}</p>
                <p className="text-teal-200">
                  <strong>Medications / Care:</strong> {ord.recommendedMedications.join(" | ")}
                </p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={submitLog} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={patientId} onChange={(e) => setPatientId(e.target.value)} className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <input type="number" value={spo2} onChange={(e) => setSpo2(Number(e.target.value))} className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <input type="number" value={hr} onChange={(e) => setHr(Number(e.target.value))} className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <input required value={note} onChange={(e) => setNote(e.target.value)} placeholder="Care Note" className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <button type="submit" className="md:col-span-4 rounded-xl bg-teal-400/90 hover:bg-teal-300 text-slate-950 font-bold py-2.5 text-sm transition">
            Record Observation
          </button>
        </form>
      </div>

      <div className="space-y-2.5">
        {logs.map((l, i) => (
          <div key={i} className="glass-card p-4 rounded-xl text-sm text-slate-200">
            <strong className="text-teal-300">{l.patient_id}</strong> - SpO2: {l.spo2}% | HR: {l.hr} bpm - {l.note}
          </div>
        ))}
      </div>
    </main>
  );
}