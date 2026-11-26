"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getActiveHospitalSession, HospitalServerAccount } from "@/lib/hospitalSession";

type GatewayChoice = "family" | "hospital" | null;

export default function HomePage() {
  const router = useRouter();
  const [hospital, setHospital] = useState<HospitalServerAccount | null>(null);
  const [showGatewayCards, setShowGatewayCards] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<GatewayChoice>(null);
  const [patientId, setPatientId] = useState("PT-101");

  useEffect(() => {
    setHospital(getActiveHospitalSession());
  }, []);

  const handleLaunchGateway = () => {
    if (hospital) {
      router.push("/select-role");
      return;
    }
    setShowGatewayCards(true);
    setSelectedChoice(null);
  };

  const handleFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = patientId.trim().toUpperCase();
    if (!cleanId) return;
    router.push(`/family/dashboard?id=${encodeURIComponent(cleanId)}`);
  };

  return (
    <main className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="glass-panel max-w-4xl w-full rounded-3xl p-8 sm:p-10 space-y-6">
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

        {/* Initial Button */}
        {!showGatewayCards && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleLaunchGateway}
              className="px-7 py-3.5 rounded-xl bg-sky-400/90 hover:bg-sky-300 text-slate-950 font-bold text-sm transition shadow-lg shadow-sky-500/25 cursor-pointer"
            >
              {hospital ? "Launch Portal Gateway" : "Launch Portal Gateway (Hospital Server Login)"}
            </button>
          </div>
        )}

        {/* Two Compact KPI Cards (Shown until one card is clicked) */}
        {showGatewayCards && selectedChoice === null && (
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <button
              type="button"
              onClick={() => setSelectedChoice("family")}
              className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-sky-400/30 transition text-left space-y-1.5 cursor-pointer"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Direct Patient ID Access
              </div>
              <div className="text-lg font-bold text-white">Family Portal Login</div>
              <p className="text-xs text-slate-300">
                Enter Patient ID directly to view live status &amp; care updates without hospital login.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedChoice("hospital")}
              className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-sky-400/30 transition text-left space-y-1.5 cursor-pointer"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                Staff &amp; Server Gateway
              </div>
              <div className="text-lg font-bold text-white">Hospital Server Sign In</div>
              <p className="text-xs text-slate-300">
                Authenticate hospital server ID &amp; password for Doctor, Nurse, or Master Desk portals.
              </p>
            </button>
          </div>
        )}

        {/* Single Selected View (Other KPI card is hidden once clicked) */}
        {showGatewayCards && selectedChoice === "family" && (
          <div className="max-w-md mx-auto bg-white rounded-2xl p-6 text-slate-900 shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Family Instant ID Login</h2>
              <button
                type="button"
                onClick={() => setSelectedChoice(null)}
                className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
              >
                ← Change Option
              </button>
            </div>
            <p className="text-xs text-slate-600">
              No hospital server login required. Enter Patient ID (e.g., PT-101) to open patient medical updates.
            </p>
            <form onSubmit={handleFamilySubmit} className="space-y-3">
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter Patient ID (e.g. PT-101)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition cursor-pointer"
              >
                Open Family Dashboard
              </button>
            </form>
          </div>
        )}

        {showGatewayCards && selectedChoice === "hospital" && (
          <div className="max-w-md mx-auto bg-white rounded-2xl p-6 text-slate-900 shadow-xl space-y-4 text-center">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Hospital Server Sign In</h2>
              <button
                type="button"
                onClick={() => setSelectedChoice(null)}
                className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
              >
                ← Change Option
              </button>
            </div>
            <p className="text-xs text-slate-600 text-left">
              Proceed to the Hospital Server Gateway to authenticate with your Hospital Server ID and password.
            </p>
            <Link
              href="/client/login"
              className="block w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition"
            >
              Continue to Hospital Server Login
            </Link>
          </div>
        )}

        {/* Instructions Placed Directly Below the Gateway / KPI Cards */}
        <div className="pt-4 border-t border-white/10 text-left space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-300">
            Emergency First Aid Protocol • India Emergency: 112
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            <strong>What To Do When Anybody Suddenly Faints:</strong> Keep surroundings safe, help the person lie flat, check breathing and responsiveness, call 112 immediately if unresponsive or breathing abnormally, and avoid giving food or liquids until fully awake.
          </p>
        </div>
      </div>
    </main>
  );
}