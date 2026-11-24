"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getActiveHospitalSession,
  HospitalServerAccount,
  logoutHospitalServer,
} from "@/lib/hospitalSession";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

type ThemeMode = "midnight-glass" | "ocean-glass" | "light-glass";

const THEME_KEY = "aerotriage_theme_mode_v1";
const THEME_ORDER: ThemeMode[] = ["midnight-glass", "ocean-glass", "light-glass"];
const THEME_LABELS: Record<ThemeMode, string> = {
  "midnight-glass": "Theme: Midnight Glass",
  "ocean-glass": "Theme: Ocean Glass",
  "light-glass": "Theme: Frost Light",
};

export default function TopUtilityBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<ThemeMode>("midnight-glass");
  const [hospital, setHospital] = useState<HospitalServerAccount | null>(null);
  const [cloudReady, setCloudReady] = useState(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(THEME_KEY) as ThemeMode | null)
        : null;
    const initial: ThemeMode =
      saved && THEME_ORDER.includes(saved) ? saved : "midnight-glass";
    setTheme(initial);
    document.body.setAttribute("data-theme", initial);
    setHospital(getActiveHospitalSession());
    setCloudReady(isSupabaseConfigured());
  }, [pathname]);

  function cycleTheme() {
    const idx = THEME_ORDER.indexOf(theme);
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    setTheme(next);
    document.body.setAttribute("data-theme", next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, next);
    }
  }

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(pathname === "/" ? "/client/login" : "/");
    }
  }

  function handleHospitalLogout() {
    logoutHospitalServer();
    setHospital(null);
    router.push("/client/login");
  }

  return (
    <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4">
      <div className="glass-card rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 font-bold text-sky-300 transition"
          >
            ← Back
          </button>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 font-semibold transition"
          >
            Home
          </Link>
          <Link
            href={hospital ? "/client/dashboard" : "/client/login"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 font-bold text-cyan-300 transition"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M12 7v4M10 9h4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Hospital Portal</span>
          </Link>
          {hospital && (
            <Link
              href="/select-role"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 font-semibold transition"
            >
              AeroTriage Portals
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] ${
              cloudReady
                ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
                : "bg-amber-500/15 border-amber-400/30 text-amber-300"
            }`}
          >
            {cloudReady ? "Supabase Cloud: Active" : "Supabase: Local Fallback"}
          </span>

          {hospital ? (
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-200 font-semibold">
                {hospital.hospitalName} ({hospital.hospitalId})
              </span>
              <button
                type="button"
                onClick={handleHospitalLogout}
                className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-rose-300 font-bold"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/client/login"
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 font-semibold"
            >
              Hospital Server Locked
            </Link>
          )}

          <button
            type="button"
            onClick={cycleTheme}
            className="px-3.5 py-1.5 rounded-xl bg-sky-400/20 hover:bg-sky-400/30 border border-sky-400/35 font-bold text-sky-200 transition"
          >
            {THEME_LABELS[theme]}
          </button>
        </div>
      </div>
    </header>
  );
}