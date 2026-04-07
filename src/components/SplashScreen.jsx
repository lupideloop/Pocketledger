import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState("in"); // "in" | "hold" | "out"

  useEffect(() => {
    // Fade in → hold → fade out
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("out"), 1800);
    const t3 = setTimeout(() => onDone(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1A1A2E]"
      style={{
        opacity: phase === "out" ? 0 : 1,
        transition: phase === "out" ? "opacity 0.55s ease-in" : "opacity 0.4s ease-out",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          transform: phase === "in" ? "scale(0.7)" : "scale(1)",
          opacity: phase === "in" ? 0 : 1,
          transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease-out",
        }}
        className="flex flex-col items-center gap-5"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#F0D58C] flex items-center justify-center shadow-2xl shadow-[#C9A84C]/30">
          <span className="text-[#1A1A2E] font-bold text-4xl select-none">H</span>
        </div>

        {/* App name */}
        <div className="text-center">
          <p className="text-white font-semibold text-2xl tracking-wide">HomeFinance</p>
          <p className="text-white/40 text-sm mt-1 tracking-widest uppercase">Personal Wealth</p>
        </div>
      </div>

      {/* Loading bar */}
      <div
        className="absolute bottom-16 w-32 h-0.5 rounded-full bg-white/10 overflow-hidden"
        style={{ opacity: phase === "in" ? 0 : 1, transition: "opacity 0.3s ease 0.3s" }}
      >
        <div
          className="h-full bg-gradient-to-r from-[#C9A84C] to-[#F0D58C] rounded-full"
          style={{
            width: phase === "out" ? "100%" : phase === "hold" ? "70%" : "10%",
            transition: phase === "hold"
              ? "width 1.2s cubic-bezier(0.4,0,0.2,1)"
              : phase === "out"
              ? "width 0.4s ease-in"
              : "width 0.3s ease-out",
          }}
        />
      </div>
    </div>
  );
}