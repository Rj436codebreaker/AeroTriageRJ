"use client";

import React, { useEffect, useState } from "react";
import {
  clearAuditHistory,
  deleteHospitalServer,
  HospitalServerAccount,
  isOwnerAuthenticated,
  loadAuditHistory,
  loadHospitalAccounts,
  loginAsOwner,
  logoutOwner,
  OwnerAuditEvent,
} from "@/lib/hospitalSession";

function AeroBrandMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aeroFrostBadge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#aeroFrostBadge)" />
      <path
        d="M14 34h8l4-10 6 18 4-10h16"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45 20l5 4-5 4"
        fill="none"
        stroke="#cffafe"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function OwnerConsoleButton() {
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"servers" | "history">("servers");
  const [hospitals, setHospitals] = useState<HospitalServerAccount[]>([]);
  const [history, setHistory] = useState<OwnerAuditEvent[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refreshData() {
    setHospitals(loadHospitalAccounts());
    setHistory(loadAuditHistory());
  }

  useEffect(() => {
    if (open) {
      setUnlocked(isOwnerAuthenticated());
      refreshData();
      setError("");
    }
  }, [open]);

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (loginAsOwner(passcode)) {
      setUnlocked(true);
      setPasscode("");
      setError("");
      refreshData();
    } else {
      setError("Invalid owner passcode.");
    }
  }

  async function handleDelete(item: HospitalServerAccount) {
    setBusyId(item.hospitalId);
    const updated = await deleteHospitalServer(item.hospitalId, item.serverCode);
    setHospitals(updated);
    setHistory(loadAuditHistory());
    setBusyId(null);
  }

  function handleLock() {
    logoutOwner();
    setUnlocked(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="AeroTriage Owner Console (Login History & Server Management)"
        aria-label="AeroTriage Owner Console"
        className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-sky-200/90 bg-white/90 shadow-[0_8px_24px_rgba(14,116,144,0.18)] backdrop-blur-md hover:scale-105 hover:border-cyan-400 transition"
      >
        <AeroBrandMark className="h-7 w-7" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/25 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-sky-200/90 bg-[#f2fafe]/95 p-6 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-sky-200/80 pb-3">
              <div className="flex items-center gap-3">
                <AeroBrandMark className="h-9 w-9 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                    AeroTriageRJ Owner Controls
                  </p>
                  <h2 className="text-lg font-bold text-slate-900">
                    {unlocked ? "Owner Dashboard" : "Owner Sign In"}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unlocked && (
                  <button
                    type="button"
                    onClick={handleLock}
                    className="rounded-lg border border-sky-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-sky-100/70"
                  >
                    Lock
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-sky-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-sky-100/70"
                >
                  Close
                </button>
              </div>
            </div>

            {!unlocked ? (
              <form onSubmit={handleUnlock} className="space-y-3">
                <p className="text-xs text-slate-600">
                  Enter owner passcode to view login history and delete hospital servers.
                </p>
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Owner Passcode"
                  className="w-full rounded-xl border border-sky-200 bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-cyan-500"
                />
                {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-sky-500 py-2.5 text-sm font-bold text-white shadow-sm hover:from-cyan-400 hover:to-sky-400 transition"
                >
                  Unlock Owner Console
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTab("servers");
                      refreshData();
                    }}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                      tab === "servers"
                        ? "bg-linear-to-r from-cyan-500 to-sky-500 text-white shadow-xs"
                        : "border border-sky-200 bg-white/80 text-slate-700 hover:bg-sky-100/70"
                    }`}
                  >
                    Hospital Servers ({hospitals.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab("history");
                      refreshData();
                    }}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                      tab === "history"
                        ? "bg-linear-to-r from-cyan-500 to-sky-500 text-white shadow-xs"
                        : "border border-sky-200 bg-white/80 text-slate-700 hover:bg-sky-100/70"
                    }`}
                  >
                    Login & Activity History ({history.length})
                  </button>
                </div>

                {tab === "servers" ? (
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {hospitals.map((h) => (
                      <div
                        key={`${h.hospitalId}-${h.serverCode}`}
                        className="flex items-center justify-between rounded-xl border border-sky-200/80 bg-white/85 px-3.5 py-2.5"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {h.hospitalName}{" "}
                            <span className="font-mono text-xs text-cyan-700">
                              ({h.hospitalId} · {h.serverCode})
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">{h.address}</div>
                        </div>
                        <button
                          type="button"
                          disabled={busyId === h.hospitalId}
                          onClick={() => handleDelete(h)}
                          className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                        >
                          {busyId === h.hospitalId ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    ))}
                    {hospitals.length === 0 && (
                      <p className="text-xs text-slate-500 py-4 text-center">
                        No hospital servers available.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          clearAuditHistory();
                          setHistory([]);
                        }}
                        className="text-xs font-medium text-rose-600 hover:underline"
                      >
                        Clear History
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {history.map((ev) => (
                        <div
                          key={ev.id}
                          className="rounded-xl border border-sky-200/80 bg-white/85 px-3.5 py-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-cyan-800">
                              {ev.action} — {ev.hospitalName} ({ev.serverCode})
                            </span>
                            <span className="text-slate-500 shrink-0">{ev.timestamp}</span>
                          </div>
                          <div className="text-slate-600 mt-0.5">{ev.detail}</div>
                        </div>
                      ))}
                      {history.length === 0 && (
                        <p className="text-xs text-slate-500 py-4 text-center">
                          No login or registration activity recorded yet.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}