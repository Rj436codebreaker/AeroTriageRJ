"use client";

import { getActiveHospitalSession } from "@/lib/hospitalSession";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import CompactPatientBar from "@/components/CompactPatientBar";
import {
  addReceipt,
  DirectoryRecord,
  findPatientById,
  loadReceipts,
  ReceiptItem,
} from "@/lib/directoryStore";

export default function PatientDashboardPage() {
  const [patientId, setPatientId] = useState("PT-101");
  const [patientRecord, setPatientRecord] = useState<DirectoryRecord | undefined>(undefined);
  const [summary, setSummary] = useState<any>(null);
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [serviceName, setServiceName] = useState("Consultation & Diagnostic Receipt");
  const [amount, setAmount] = useState(2500);

  useEffect(() => {
    const savedId =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("id") ||
          window.localStorage.getItem("aerotriage_active_patient_id") ||
          "PT-101"
        : "PT-101";
    setPatientId(savedId);
    setPatientRecord(findPatientById(savedId));
    setReceipts(loadReceipts());
  }, []);

  useEffect(() => {
    setPatientRecord(findPatientById(patientId));
    fetch(`${API_BASE_URL}/api/patients/${encodeURIComponent(patientId)}/summary`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setSummary)
      .catch(() => {});
  }, [patientId]);

  function handleGenerateReceipt(e: React.FormEvent) {
    e.preventDefault();
    const rec = findPatientById(patientId);
    const item: ReceiptItem = {
      hospitalId: getActiveHospitalSession()?.hospitalId || "H2", receiptNo: `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patientId.toUpperCase(),
      patientName: rec?.name || "Registered Patient",
      date: new Date().toISOString().slice(0, 10),
      service: serviceName.trim() || "Hospital Care Charges",
      amount: Number(amount) || 0,
      status: "Paid",
    };
    setReceipts(addReceipt(item));
  }

  const patientReceipts = receipts.filter(
    (r) => r.patientId.toUpperCase() === patientId.toUpperCase()
  );

  return (
    <main className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-bold text-indigo-300">Patient Portal & Receipts</h1>
          <div className="flex gap-2">
            <input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value.toUpperCase())}
              placeholder="Enter Patient ID (PT-101)"
              className="glass-input rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
            />
          </div>
        </div>

        <CompactPatientBar defaultPatientId={patientId} onSelectPatient={setPatientId} />

        {(patientRecord || summary) && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-xs sm:text-sm text-slate-200 space-y-1">
            <p>
              <strong>ID:</strong> {patientId} | <strong>Name:</strong>{" "}
              {patientRecord?.name || summary?.patient_id || "Patient"} |{" "}
              <strong>Status:</strong> {patientRecord?.status || summary?.status || "Active"}
            </p>
            <p className="text-slate-300">
              {summary?.latest_notes || patientRecord?.latestNotes || "Vitals under active monitoring."}
            </p>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Billing & Receipts Manager</h2>
        <form onSubmit={handleGenerateReceipt} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            required
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="Service / Receipt Description"
            className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
          <input
            type="number"
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Amount (INR)"
            className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-400/90 hover:bg-indigo-300 text-slate-950 font-bold py-2.5 text-sm transition"
          >
            Issue Receipt
          </button>
        </form>

        <div className="space-y-2.5 pt-2">
          {(patientReceipts.length > 0 ? patientReceipts : receipts).map((rc) => (
            <div
              key={rc.receiptNo}
              className="glass-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm"
            >
              <div>
                <span className="font-mono font-bold text-indigo-300">{rc.receiptNo}</span> •{" "}
                <strong className="text-white">{rc.patientId}</strong> ({rc.patientName}) — {rc.service}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-300">{rc.date}</span>
                <span className="font-bold text-white">INR {rc.amount}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  {rc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}