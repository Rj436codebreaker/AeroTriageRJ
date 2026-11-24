"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  loginHospitalServer,
  registerHospitalServer,
} from "@/lib/hospitalSession";
import { syncTableRowToSupabase } from "@/lib/supabaseClient";

export default function ClientHospitalRegisterPage() {
  const router = useRouter();
  const [hospitalId, setHospitalId] = useState("H4");
  const [hospitalName, setHospitalName] = useState("");
  const [address, setAddress] = useState("Lucknow, Uttar Pradesh");
  const [serverCode, setServerCode] = useState("HOSP-LKO-04");
  const [password, setPassword] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const record = {
      hospitalId: hospitalId.trim().toUpperCase(),
      hospitalName: hospitalName.trim(),
      address: address.trim(),
      serverCode: serverCode.trim().toUpperCase(),
      password: password.trim(),
    };
    registerHospitalServer(record);
    loginHospitalServer(record.serverCode, record.password);
    await syncTableRowToSupabase("aerotriage_hospitals", {
      id: record.hospitalId,
      name: record.hospitalName,
      address: record.address,
      server_code: record.serverCode,
      password_hash: record.password,
      total_beds: 40,
      available_beds: 15,
    });
    router.push("/select-role");
  }

  return (
    <main className="min-h-[68vh] flex items-center justify-center p-6">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-7 space-y-5">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-cyan-300 font-semibold">
            New Hospital Onboarding
          </span>
          <h1 className="text-2xl font-bold text-white">Register Hospital Server</h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          <input
            required
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
            placeholder="Hospital Grid ID (e.g. H4)"
            className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm font-mono text-white outline-none"
          />
          <input
            required
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            placeholder="Hospital Name"
            className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Hospital Address"
            className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
          <input
            required
            value={serverCode}
            onChange={(e) => setServerCode(e.target.value)}
            placeholder="Server Login Code (e.g. HOSP-LKO-04)"
            className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm font-mono text-white outline-none"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create Server Password"
            className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-400/90 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition"
          >
            Register Hospital & Enter AeroTriage Portals
          </button>
        </form>

        <div className="text-xs text-slate-300 pt-2 border-t border-white/10">
          <Link href="/client/login" className="text-cyan-300 hover:underline">
            Already registered? Sign In to Hospital Server
          </Link>
        </div>
      </div>
    </main>
  );
}