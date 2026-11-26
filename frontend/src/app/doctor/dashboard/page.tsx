"use client";

import React, { useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import CompactPatientBar from "@/components/CompactPatientBar";
import { buildClinicalRecommendations, saveCareOrder } from "@/lib/careOrdersStore";
import { findPatientById } from "@/lib/directoryStore";

export default function DoctorDashboardPage() {
  const [patientId, setPatientId] = useState("PT-101");
  const [patientName, setPatientName] = useState("Ramesh Kumar");
  const [age, setAge] = useState(62);
  const [hr, setHr] = useState(124);
  const [sbp, setSbp] = useState(86);
  const [spo2, setSpo2] = useState(89);
  const [troponin, setTroponin] = useState(0.18);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const autoPlan = useMemo(
    () =>
      buildClinicalRecommendations({
        hr: Number(hr),
        sbp: Number(sbp),
        spo2: Number(spo2),
        troponin: Number(troponin),
      }),
    [hr, sbp, spo2, troponin]
  );

  const [nurseNote, setNurseNote] = useState("");
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [customMed, setCustomMed] = useState("");
  const [sentBanner, setSentBanner] = useState("");

  function handlePatientSelect(id: string) {
    setPatientId(id);
    const found = findPatientById(id);
    if (found?.name) {
      setPatientName(found.name);
    }
  }

  function syncPlanFromVitals(nextPlan = autoPlan) {
    setNurseNote(nextPlan.nurseInstruction);
    setSelectedMeds(nextPlan.medications);
  }

  async function runAssessment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSentBanner("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctors/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: patientName,
          age: Number(age),
          hr: Number(hr),
          sbp: Number(sbp),
          spo2: Number(spo2),
          troponin: Number(troponin),
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setResult(json);
        syncPlanFromVitals(autoPlan);
      }
    } finally {
      setLoading(false);
    }
  }

  function addCustomMedication() {
    const clean = customMed.trim();
    if (!clean) return;
    setSelectedMeds((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    setCustomMed("");
  }

  function toggleMedication(med: string) {
    setSelectedMeds((prev) =>
      prev.includes(med) ? prev.filter((m) => m !== med) : [...prev, med]
    );
  }

  function sendOrderToNurse() {
    const activeNote = (nurseNote || autoPlan.nurseInstruction).trim();
    const activeMeds = selectedMeds.length > 0 ? selectedMeds : autoPlan.medications;
    const tier = result?.analysis?.triage_tier || result?.triage_tier || "Critical";

    saveCareOrder({
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patientId.toUpperCase(),
      patientName,
      triageTier: tier,
      nurseInstruction: activeNote,
      recommendedMedications: activeMeds,
      createdAt: new Date().toLocaleTimeString(),
    });
    setSentBanner(`Order sent to Nurse Desk for ${patientName} (${patientId.toUpperCase()}).`);
  }

  const effectiveMeds = Array.from(new Set([...autoPlan.medications, ...selectedMeds]));

  return (
    <main className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <h1 className="text-2xl font-bold text-sky-300">Doctor Triage & Analytical Engine</h1>
        <CompactPatientBar defaultPatientId={patientId} onSelectPatient={handlePatientSelect} />

        <form onSubmit={runAssessment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Patient Name" className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} placeholder="Age" className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <input type="number" value={hr} onChange={(e) => setHr(Number(e.target.value))} placeholder="Heart Rate" className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <input type="number" value={sbp} onChange={(e) => setSbp(Number(e.target.value))} placeholder="SBP" className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <input type="number" value={spo2} onChange={(e) => setSpo2(Number(e.target.value))} placeholder="SpO2" className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <input type="number" step="0.01" value={troponin} onChange={(e) => setTroponin(Number(e.target.value))} placeholder="Troponin" className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none" />
          <button type="submit" disabled={loading} className="sm:col-span-2 lg:col-span-3 rounded-xl bg-sky-400/90 hover:bg-sky-300 text-slate-950 font-bold py-2.5 text-sm transition">
            {loading ? "Analyzing Vitals..." : "Run Triage & Routing"}
          </button>
        </form>
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-teal-300">
            Nurse Instructions & Recommended Medications
          </h2>
          <button
            type="button"
            onClick={() => syncPlanFromVitals(autoPlan)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-slate-100"
          >
            Auto-Fill from Current Vitals
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-300">Instruction for Nurse</label>
          <textarea
            rows={2}
            value={nurseNote || autoPlan.nurseInstruction}
            onChange={(e) => setNurseNote(e.target.value)}
            className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-300">Recommended Medications / Care Measures (click to toggle)</p>
          <div className="flex flex-wrap gap-2">
            {effectiveMeds.map((med) => {
              const active = (selectedMeds.length > 0 ? selectedMeds : autoPlan.medications).includes(med);
              return (
                <button
                  key={med}
                  type="button"
                  onClick={() => toggleMedication(med)}
                  className={`px-3 py-1.5 rounded-xl text-xs border transition text-left ${
                    active
                      ? "bg-teal-400/20 border-teal-300 text-teal-100 font-semibold"
                      : "bg-white/5 border-white/15 text-slate-300"
                  }`}
                >
                  {active ? "✓ " : "+ "}
                  {med}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              value={customMed}
              onChange={(e) => setCustomMed(e.target.value)}
              placeholder="Add custom medication or clinical instruction..."
              className="glass-input flex-1 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
            />
            <button
              type="button"
              onClick={addCustomMedication}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white"
            >
              Add Med
            </button>
          </div>
        </div>

        <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={sendOrderToNurse}
            className="px-5 py-2.5 rounded-xl bg-teal-400/90 hover:bg-teal-300 text-slate-950 font-bold text-sm transition"
          >
            Send Instructions & Medications to Nurse
          </button>
          {sentBanner && <span className="text-xs text-emerald-300 font-semibold">{sentBanner}</span>}
        </div>
      </div>

      {result && (
        <div className="glass-panel rounded-2xl p-6 space-y-2 text-sm">
          <p className="font-bold text-base text-white">
            Triage Tier:{" "}
            <span className="text-sky-300">
              {result.analysis?.triage_tier || result.triage_tier || "Evaluated"}
            </span>
          </p>
          <pre className="text-xs text-slate-200 overflow-x-auto bg-slate-950/40 p-4 rounded-xl border border-white/10">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}