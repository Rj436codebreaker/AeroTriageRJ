"use client";

import React, { useState } from "react";

interface StepItem {
  num: string;
  title: string;
  desc: string;
  accent: string;
  svgType: "safe" | "lie" | "check" | "call" | "recovery" | "cpr" | "rest";
}

const STEPS: StepItem[] = [
  {
    num: "1",
    title: "Don't panic",
    desc: "Make sure the surrounding area is safe.",
    accent: "text-sky-300 border-sky-400/30 bg-sky-500/10",
    svgType: "safe",
  },
  {
    num: "2",
    title: "Make them lie down",
    desc: "Gently lay them flat. If there is no injury, elevate their legs slightly.",
    accent: "text-teal-300 border-teal-400/30 bg-teal-500/10",
    svgType: "lie",
  },
  {
    num: "3",
    title: "Check responsiveness",
    desc: "Call their name and gently tap their shoulder.",
    accent: "text-indigo-300 border-indigo-400/30 bg-indigo-500/10",
    svgType: "check",
  },
  {
    num: "4",
    title: "Check breathing",
    desc: "Check whether they are breathing normally for no more than 10 seconds.",
    accent: "text-cyan-300 border-cyan-400/30 bg-cyan-500/10",
    svgType: "call",
  },
  {
    num: "5",
    title: "If breathing normally",
    desc: "If still unconscious, place them in the recovery position (on their side), unless an injury makes moving them unsafe. Monitor breathing.",
    accent: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
    svgType: "recovery",
  },
  {
    num: "6",
    title: "If NOT breathing normally",
    desc: "Call emergency services (112 in India), start CPR immediately and use an AED if available.",
    accent: "text-rose-300 border-rose-400/30 bg-rose-500/10",
    svgType: "cpr",
  },
  {
    num: "7",
    title: "After waking up",
    desc: "Let them rest. Arrange medical assessment, especially after a first or unexplained fainting episode.",
    accent: "text-amber-300 border-amber-400/30 bg-amber-500/10",
    svgType: "rest",
  },
];

const NEVER_DO: string[] = [
  "Never give water to an unconscious person.",
  "Never give food or medicine.",
  "Never slap them or shake them violently.",
  "Never force them to stand up immediately.",
  "Never leave an unconscious person alone.",
];

function StepIllustration({ type }: { type: StepItem["svgType"] }) {
  return (
    <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-950/55 border border-white/10 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="56" height="56" rx="12" fill="rgba(15,23,42,0.75)" />
        {type === "safe" && (
          <>
            <path d="M32 14L46 20V31C46 40.5 39.8 48.2 32 51C24.2 48.2 18 40.5 18 31V20L32 14Z" stroke="#38bdf8" strokeWidth="2.5" fill="rgba(56,189,248,0.14)" />
            <path d="M26 32L30 36L39 27" stroke="#7dd3fc" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {type === "lie" && (
          <>
            <circle cx="17" cy="28" r="5" fill="#2dd4bf" />
            <path d="M24 31H48" stroke="#5eead4" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M40 31L50 22" stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round" />
            <path d="M12 42H52" stroke="rgba(148,163,184,0.45)" strokeWidth="2" strokeDasharray="3 3" />
          </>
        )}
        {type === "check" && (
          <>
            <circle cx="24" cy="23" r="5" fill="#818cf8" />
            <path d="M16 44C16 37 20 33 24 33C28 33 32 37 32 44" stroke="#a5b4fc" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="43" cy="34" r="4.5" fill="#38bdf8" />
            <path d="M35 34H38" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
        {type === "call" && (
          <>
            <path d="M12 34H22L26 22L32 44L37 29L41 34H52" stroke="#22d3ee" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="48" cy="18" r="5" stroke="#67e8f9" strokeWidth="2" />
            <text x="45.2" y="20.5" fill="#cffafe" fontSize="7" fontWeight="bold">10s</text>
          </>
        )}
        {type === "recovery" && (
          <>
            <circle cx="19" cy="27" r="5" fill="#34d399" />
            <path d="M24 29L45 34" stroke="#6ee7b7" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M32 31L36 42L44 43" stroke="#34d399" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {type === "cpr" && (
          <>
            <path d="M32 48C32 48 16 37.5 16 25.5C16 20.5 20 17 24.5 17C27.8 17 30.5 18.8 32 21.5C33.5 18.8 36.2 17 39.5 17C44 17 48 20.5 48 25.5C48 37.5 32 48 32 48Z" fill="rgba(244,63,94,0.22)" stroke="#fb7185" strokeWidth="2.4" />
            <path d="M23 30H28L30.5 24L33.5 36L36 28H41" stroke="#fda4af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {type === "rest" && (
          <>
            <circle cx="32" cy="24" r="6" fill="#fbbf24" />
            <path d="M20 44C20 37.5 25.2 33 32 33C38.8 33 44 37.5 44 44" stroke="#fcd34d" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M44 16H50M47 13V19" stroke="#fde68a" strokeWidth="2.2" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
}

export default function FaintingProtocolBanner() {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-10">
      <div className="glass-panel rounded-2xl p-5 sm:p-7 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
              <span>Emergency First Aid Protocol</span>
              <span>•</span>
              <span>India Emergency: 112</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              What To Do When Anybody Suddenly Faints
            </h2>
            <p className="text-sm text-slate-300">
              Remember these 7 steps. They can help save someone&apos;s life.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-400/25 text-xs font-mono text-sky-200">
              SAFE → LIE DOWN → CHECK → CALL → ACT
            </div>
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-slate-100 transition"
            >
              {expanded ? "Compact View" : "Show All 7 Steps"}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-rose-950/45 border border-rose-400/35 p-4 text-xs sm:text-sm text-rose-100 leading-relaxed">
          <strong className="text-rose-300 font-bold">Most important:</strong> An unconscious person who isn&apos;t breathing normally may be experiencing cardiac arrest, not simple fainting. Start CPR without delay. Call emergency services (<strong className="text-white">112</strong> in India).
        </div>

        {expanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {STEPS.map((step) => (
              <div key={step.num} className="glass-card rounded-xl p-4 flex items-start gap-3.5">
                <StepIllustration type={step.svgType} />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md border text-xs font-bold ${step.accent}`}>
                      Step {step.num}
                    </span>
                    <h3 className="font-semibold text-sm sm:text-base text-white">{step.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
          <div className="lg:col-span-7 glass-card rounded-xl p-4 space-y-2.5">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
              Never do these 5 things
            </h3>
            <ol className="space-y-1.5 text-xs sm:text-sm text-slate-200 list-decimal list-inside">
              {NEVER_DO.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-5 glass-card rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                Remember this simple formula
              </p>
              <p className="text-sm sm:text-base font-bold text-white tracking-wide">
                SAFE → LIE DOWN → CHECK → CALL → ACT
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                112 is India&apos;s emergency number. Keep the airway clear, stay calm, and never leave an unconscious person unattended.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>Emergency Helpline (India)</span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-400/30 text-rose-200 font-bold">
                DIAL 112
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}