"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  loadHospitalAccounts,
  loginHospitalServer,
} from "@/lib/hospitalSession";

export default function ClientHospitalLoginPage() {
  const router = useRouter();
  const accounts = loadHospitalAccounts();
  const [serverCode, setServerCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleHospitalLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const session = loginHospitalServer(serverCode, password);
    if (!session) {
      setError("Authentication Failed: Invalid Hospital Server ID or Password.");
      return;
    }
    router.push("/select-role");
  }

  return (
    <main className="min-h-[68vh] flex items-center justify-center p-6">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-7 space-y-5">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-cyan-300 font-semibold">
            Client / Hospital Server Gateway
          </span>
          <h1 className="text-2xl font-bold text-white">Hospital Server Sign In</h1>
          <p className="text-xs text-slate-300">
            Enter your authorized Hospital Server ID and secret password to unlock your hospital&apos;s portals.
          </p>
        </div>

        <form onSubmit={handleHospitalLogin} autoComplete="off" className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Hospital Server ID</label>
            <input
              required
              autoComplete="off"
              value={serverCode}
              onChange={(e) => setServerCode(e.target.value.toUpperCase())}
              placeholder="Enter Hospital Server ID (e.g. HOSP-RML-02)"
              className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm font-mono text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Hospital Server Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Hospital Server Password"
              className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-400/25 rounded-lg p-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-400/90 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition"
          >
            Authenticate Hospital Server & Open Portals
          </button>
        </form>

        <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 space-y-1.5 text-xs">
          <p className="font-bold text-slate-200">Select Hospital Server ID (Password Required):</p>
          <div className="flex flex-wrap gap-2">
            {accounts.map((acc) => (
              <button
                key={acc.serverCode}
                type="button"
                onClick={() => {
                  setServerCode(acc.serverCode);
                  setPassword("");
                  setError("");
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-left"
              >
                <span className="font-mono font-bold text-cyan-300">{acc.serverCode}</span> — {acc.hospitalName}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/10">
          <Link href="/" className="hover:text-sky-300">← Home</Link>
          <Link href="/client/register" className="text-cyan-300 hover:underline">
            Register New Hospital Server
          </Link>
        </div>
      </div>
    </main>
  );
}