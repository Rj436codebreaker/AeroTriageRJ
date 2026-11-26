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
        title="Owner Console (Login History & Server Management)"
        aria-label="Owner Console"
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-900/90 text-cyan-300 shadow-lg backdrop-blur hover:border-cyan-400 hover:text-cyan-200 transition"
      >
        {/* Small Shield Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-slate-950 p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                  AeroTriageRJ Owner Controls
                </p>
                <h2 className="text-lg font-bold text-white">
                  {unlocked ? "Owner Dashboard" : "Owner Sign In"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {unlocked && (
                  <button
                    type="button"
                    onClick={handleLock}
                    className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10"
                  >
                    Lock
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>

            {!unlocked ? (
              <form onSubmit={handleUnlock} className="space-y-3">
                <p className="text-xs text-slate-400">
                  Enter owner passcode to view login history and delete hospital servers.
                </p>
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Owner Passcode"
                  className="w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2 text-sm text-white outline-none focus:border-cyan-400"
                />
                {error && <p className="text-xs text-rose-400">{error}</p>}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-cyan-400 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition"
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      tab === "servers"
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-slate-900 text-slate-300 hover:bg-slate-800"
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      tab === "history"
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-slate-900 text-slate-300 hover:bg-slate-800"
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
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2.5"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {h.hospitalName}{" "}
                            <span className="font-mono text-xs text-cyan-300">
                              ({h.hospitalId} · {h.serverCode})
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">{h.address}</div>
                        </div>
                        <button
                          type="button"
                          disabled={busyId === h.hospitalId}
                          onClick={() => handleDelete(h)}
                          className="rounded-lg bg-rose-500/20 border border-rose-400/40 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 disabled:opacity-50"
                        >
                          {busyId === h.hospitalId ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    ))}
                    {hospitals.length === 0 && (
                      <p className="text-xs text-slate-400 py-4 text-center">
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
                        className="text-xs text-rose-300 hover:underline"
                      >
                        Clear History
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {history.map((ev) => (
                        <div
                          key={ev.id}
                          className="rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-cyan-300">
                              {ev.action} — {ev.hospitalName} ({ev.serverCode})
                            </span>
                            <span className="text-slate-400">{ev.timestamp}</span>
                          </div>
                          <div className="text-slate-300 mt-0.5">{ev.detail}</div>
                        </div>
                      ))}
                      {history.length === 0 && (
                        <p className="text-xs text-slate-400 py-4 text-center">
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