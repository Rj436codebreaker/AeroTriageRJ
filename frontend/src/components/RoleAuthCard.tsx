"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL, PortalRole } from "@/lib/api";
import { findCredentialByIdOrEmail, findPatientById } from "@/lib/directoryStore";

interface RoleAuthCardProps {
  role: PortalRole;
  mode: "login" | "register";
}

export default function RoleAuthCard({ role, mode }: RoleAuthCardProps) {
  const router = useRouter();
  const [quickId, setQuickId] = useState("PT-101");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isInstantIdRole = role === "family" || role === "patient";

  function handleInstantIdAccess(e: React.FormEvent) {
    e.preventDefault();
    const match = findPatientById(quickId);
    if (!match) {
      setError("Patient ID not found. Try PT-101 or PT-102, or register on Hospital Portal.");
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("aerotriage_active_patient_id", match.id);
    }
    router.push(`/${role}/dashboard?id=${encodeURIComponent(match.id)}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const localMatch = findCredentialByIdOrEmail(identifier, password);
    if (localMatch) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("aerotriage_active_patient_id", localMatch.id);
      }
      setLoading(false);
      router.push(`/${role}/dashboard`);
      return;
    }

    try {
      const endpoint = mode === "login" ? "login" : "register";
      const payload =
        mode === "login"
          ? { role, email: identifier, password }
          : { role, email: identifier, password, full_name: fullName };

      const res = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.detail || "Use Hospital Portal issued ID/Password or check credentials.");
        setLoading(false);
        return;
      }

      router.push(`/${role}/dashboard`);
    } catch {
      setError("Cannot reach backend API. Use Hospital Portal issued ID/Password.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[68vh] flex items-center justify-center p-6">
      <div className="glass-panel w-full max-w-md rounded-2xl p-7 space-y-5">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-sky-300 font-semibold">{role} Portal</span>
          <h1 className="text-2xl font-bold text-white capitalize">
            {isInstantIdRole
              ? `${role} Instant ID Access`
              : mode === "login"
              ? `${role} Sign In`
              : `${role} Registration`}
          </h1>
          <p className="text-xs text-slate-300">
            Doctors, Nurses & Patients IDs/Passwords are issued from{" "}
            <Link href="/client/dashboard" className="text-sky-300 underline">
              Hospital Portal
            </Link>
            .
          </p>
        </div>

        {isInstantIdRole && (
          <form onSubmit={handleInstantIdAccess} className="space-y-3 bg-sky-500/10 border border-sky-400/25 rounded-xl p-4">
            <label className="block text-xs font-semibold text-sky-200">
              Fast Emergency Access — Enter Patient ID Only
            </label>
            <input
              required
              value={quickId}
              onChange={(e) => setQuickId(e.target.value)}
              placeholder="e.g. PT-101"
              className="glass-input w-full rounded-xl px-3.5 py-2 text-sm text-white font-mono outline-none focus:border-sky-400"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-400/90 hover:bg-emerald-300 text-slate-950 font-bold text-sm transition"
            >
              Open {role === "family" ? "Family View" : "Patient Portal"} by ID
            </button>
          </form>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Full Name</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-400"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Assigned ID or Email</label>
            <input
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. DOC-201, NUR-301, PT-101 or email"
              className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-400"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-400/25 rounded-lg p-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-sky-400/90 hover:bg-sky-300 text-slate-950 font-bold text-sm transition disabled:opacity-50"
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In with ID / Email" : "Create Account"}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/10">
          <Link href="/select-role" className="hover:text-sky-300">All Roles</Link>
          <Link href="/client/dashboard" className="text-sky-300 hover:underline">
            Hospital Portal (Issue IDs)
          </Link>
        </div>
      </div>
    </main>
  );
}