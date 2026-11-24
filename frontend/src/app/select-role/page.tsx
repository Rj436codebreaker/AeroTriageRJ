"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getActiveHospitalSession, HospitalServerAccount } from "@/lib/hospitalSession";

const ROLES = [
  { key: "doctor", title: "Doctor Portal", desc: "Vitals triage, root-cause & routing" },
  { key: "nurse", title: "Nurse Portal", desc: "Observations & care monitoring" },
  { key: "patient", title: "Patient Portal", desc: "Instant ID profile & billing receipts" },
  { key: "family", title: "Family Portal", desc: "Instant ID patient status & emergency steps" },
  { key: "ambulance", title: "Ambulance Portal", desc: "Dispatch queue & hospital route" },
  { key: "client", title: "Hospital Master Desk", desc: "Issue Staff, Doctor, Nurse & Patient IDs" },
];

export default function SelectRolePage() {
  const router = useRouter();
  const [hospital, setHospital] = useState<HospitalServerAccount | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const active = getActiveHospitalSession();
    if (!active) {
      router.replace("/client/login");
      return;
    }
    setHospital(active);
    setChecked(true);
  }, [router]);

  if (!checked || !hospital) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="glass-panel rounded-2xl p-6 text-sm text-slate-300">
          Verifying Hospital Server Session...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[68vh] p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            Active Hospital: {hospital.hospitalName} ({hospital.serverCode})
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-sky-300">AeroTriage Portals</h1>
          <p className="text-sm text-slate-300">
            All portals below are isolated to <strong className="text-white">{hospital.hospitalName}</strong>.
          </p>
        </div>
        <Link
          href="/client/dashboard"
          className="px-4 py-2.5 rounded-xl bg-cyan-400/90 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition self-start"
        >
          Manage IDs & Staff Directory
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ROLES.map((r) => (
          <div key={r.key} className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">{r.title}</h2>
              <p className="text-xs sm:text-sm text-slate-300">{r.desc}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={r.key === "client" ? "/client/dashboard" : `/${r.key}/login`}
                className="px-4 py-2 rounded-lg bg-sky-400/90 hover:bg-sky-300 text-slate-950 font-semibold text-xs transition"
              >
                {r.key === "client" ? "Open Master Desk" : "Open Portal"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}