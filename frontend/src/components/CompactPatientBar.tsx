"use client";

import React, { useEffect, useState } from "react";
import { DirectoryRecord, findPatientById, loadDirectory } from "@/lib/directoryStore";

interface CompactPatientBarProps {
  defaultPatientId?: string;
  onSelectPatient?: (patientId: string) => void;
}

export default function CompactPatientBar({
  defaultPatientId = "PT-101",
  onSelectPatient,
}: CompactPatientBarProps) {
  const [patients, setPatients] = useState<DirectoryRecord[]>([]);
  const [selectedId, setSelectedId] = useState(defaultPatientId);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const all = loadDirectory().filter((r) => r.category === "patients");
    setPatients(all);
  }, []);

  const activePatient = findPatientById(selectedId) || patients[0];

  function handleChange(id: string) {
    setSelectedId(id);
    if (onSelectPatient) onSelectPatient(id);
  }

  if (!activePatient) return null;

  return (
    <div className="glass-card rounded-xl px-4 py-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/30 text-sky-200 font-mono font-bold">
            {activePatient.id}
          </span>
          <span className="font-semibold text-white">{activePatient.name}</span>
          <span className="text-slate-300">• {activePatient.status || "Active"}</span>
          <span className="text-teal-300 hidden sm:inline">• {activePatient.roleOrWard}</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => handleChange(e.target.value)}
            className="glass-input rounded-lg px-2 py-1 text-xs text-slate-100 outline-none"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                {p.id} - {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-slate-100 font-medium"
          >
            {expanded ? "Shrink" : "Expand"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-4 text-slate-300">
          <span>Mobile: <strong className="text-white">{activePatient.mobile}</strong></span>
          <span>Email: <strong className="text-white">{activePatient.email}</strong></span>
          <span>Notes: <strong className="text-white">{activePatient.latestNotes || "Standard care"}</strong></span>
        </div>
      )}
    </div>
  );
}