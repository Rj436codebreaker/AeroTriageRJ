"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveHospitalSession, HospitalServerAccount } from "@/lib/hospitalSession";

export default function HomePage() {
  const [hospital, setHospital] = useState<HospitalServerAccount | null>(null);

  useEffect(() => {
    setHospital(getActiveHospitalSession());
  }, []);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-panel max-w-3xl w-full rounded-3xl p-8 sm:p-12 space-y-6">
        <span className="inline-block px-3.5 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-semibold tracking-wider uppercase">
          Lucknow Emergency Grid Network • Supabase Secured
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-sky-300">
          AeroTriage Enterprise CDSS
        </h1>
        <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          AI-powered multi-class clinical risk stratification, root-cause vital analytics, and hospital-isolated bed routing across Lucknow.
        </p>

        {hospital && (
          <div className="inline-block px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-xs sm:text-sm text-emerald-200 font-semibold">
            Connected Hospital Server: {hospital.hospitalName} ({hospital.serverCode})
          </div>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={hospital ? "/select-role" : "/client/login"}
            className="px-7 py-3.5 rounded-xl bg-sky-400/90 hover:bg-sky-300 text-slate-950 font-bold text-sm transition shadow-lg shadow-sky-500/25"
          >
            {hospital ? "Launch Portal Gateway" : "Launch Portal Gateway (Hospital Server Login)"}
          </Link>
        </div>
      </div>
    </main>
  );
}