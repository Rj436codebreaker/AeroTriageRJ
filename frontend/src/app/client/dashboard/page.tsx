"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import CompactPatientBar from "@/components/CompactPatientBar";
import {
  addDirectoryRecord,
  DirectoryCategory,
  DirectoryRecord,
  loadDirectory,
} from "@/lib/directoryStore";
import { getActiveHospitalSession, HospitalServerAccount } from "@/lib/hospitalSession";

const TABS: { key: DirectoryCategory; label: string; prefix: string }[] = [
  { key: "staff", label: "Staff", prefix: "STF" },
  { key: "doctors", label: "Doctors", prefix: "DOC" },
  { key: "nurses", label: "Nurses", prefix: "NUR" },
  { key: "patients", label: "Patients", prefix: "PT" },
];

export default function ClientDashboardPage() {
  const router = useRouter();
  const [hospital, setHospital] = useState<HospitalServerAccount | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<DirectoryCategory>("doctors");
  const [records, setRecords] = useState<DirectoryRecord[]>([]);

  const [customId, setCustomId] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleOrWard, setRoleOrWard] = useState("");
  const [issuedBanner, setIssuedBanner] = useState<DirectoryRecord | null>(null);

  useEffect(() => {
    const active = getActiveHospitalSession();
    if (!active) {
      router.replace("/client/login");
      return;
    }
    setHospital(active);
    setRecords(loadDirectory(true));
    fetch(`${API_BASE_URL}/api/hospitals/grid`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setHospitals)
      .catch(() => {});
  }, [router]);

  function generateNextId(cat: DirectoryCategory) {
    const prefix = TABS.find((t) => t.key === cat)?.prefix || "ID";
    const existingNums = loadDirectory(false)
      .filter((r) => r.category === cat)
      .map((r) => parseInt(r.id.replace(/\D+/g, ""), 10))
      .filter((n) => !Number.isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 101;
    return `${prefix}-${nextNum}`;
  }

  function handleRegisterMember(e: React.FormEvent) {
    e.preventDefault();
    if (!hospital) return;
    const assignedId = (customId.trim() || generateNextId(activeTab)).toUpperCase();
    const assignedPass = password.trim() || `${assignedId}@Aero2026`;
    const newRec: DirectoryRecord = {
      id: assignedId,
      hospitalId: hospital.hospitalId,
      category: activeTab,
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      password: assignedPass,
      roleOrWard: roleOrWard.trim() || `${hospital.hospitalName} Unit`,
      status: "Registered",
      latestNotes: `Issued under ${hospital.hospitalName}`,
      billAmount: activeTab === "patients" ? 5000 : 0,
      paidAmount: 0,
    };
    addDirectoryRecord(newRec);
    setRecords(loadDirectory(true));
    setIssuedBanner(newRec);
    setCustomId("");
    setName("");
    setMobile("");
    setEmail("");
    setPassword("");
    setRoleOrWard("");
  }

  if (!hospital) return null;

  const filtered = records.filter((r) => r.category === activeTab);

  return (
    <main className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              {hospital.hospitalName} ({hospital.serverCode})
            </span>
            <h1 className="text-2xl font-bold text-white">Hospital / Client Master Portal</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Issue roll-style ID + Password for Staff, Doctors, Nurses & Patients of {hospital.hospitalName}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setActiveTab(t.key);
                  setIssuedBanner(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                  activeTab === t.key
                    ? "bg-cyan-400 text-slate-950 border-cyan-300"
                    : "bg-white/5 text-slate-200 border-white/15 hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <CompactPatientBar />

        {issuedBanner && (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/35 p-4 text-xs sm:text-sm text-emerald-100">
            <strong>Credential Issued ({issuedBanner.category.toUpperCase()}):</strong>{" "}
            ID: <span className="font-mono font-bold text-white">{issuedBanner.id}</span> |{" "}
            Password: <span className="font-mono font-bold text-white">{issuedBanner.password}</span> |{" "}
            Hospital: <span className="text-white">{hospital.hospitalName}</span>
          </div>
        )}

        <form onSubmit={handleRegisterMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          <input
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
            placeholder={`Auto ID (${generateNextId(activeTab)}) or custom ID`}
            className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
          />
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
          <input
            required
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile Number"
            className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (auto-generated if blank)"
            className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
          <input
            value={roleOrWard}
            onChange={(e) => setRoleOrWard(e.target.value)}
            placeholder="Department / Ward / Role"
            className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
          />
          <button
            type="submit"
            className="sm:col-span-2 lg:col-span-3 rounded-xl bg-cyan-400/90 hover:bg-cyan-300 text-slate-950 font-bold py-2.5 text-sm transition"
          >
            Register {activeTab.slice(0, -1).toUpperCase()} & Sync to Supabase
          </button>
        </form>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/15 text-slate-300">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Mobile</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Password</th>
                <th className="py-2.5 px-3">Dept / Ward</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-white/10 text-slate-100">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">{r.id}</td>
                  <td className="py-2.5 px-3">{r.name}</td>
                  <td className="py-2.5 px-3">{r.mobile}</td>
                  <td className="py-2.5 px-3">{r.email}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-200">{r.password}</td>
                  <td className="py-2.5 px-3 text-slate-300">{r.roleOrWard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {hospitals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hospitals.map((h) => (
            <div key={h.id} className="glass-card p-5 rounded-2xl space-y-1.5">
              <h2 className="font-bold text-base text-white">{h.name}</h2>
              <p className="text-xs text-slate-300">{h.address}</p>
              <p className="text-sm text-slate-200 pt-1">
                Beds: <strong className="text-cyan-300">{h.available_beds}/{h.total_beds}</strong>
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}