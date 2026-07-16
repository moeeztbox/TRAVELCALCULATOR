import React, { useEffect, useMemo, useRef, useState } from "react";
import logo from "../../Assets/logo-mark.png";

// The splash always stays up for a fixed duration (no dependency on how fast
// the app loads). Progress fills smoothly across the full window, then the
// splash fades out and the app/login page is shown.
const DISPLAY_MS = 10000;
const FADE_OUT_MS = 700;

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const finishedRef = useRef(false);

  // Pre-compute floating particles once so they don't jump on re-render.
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, () => ({
        left: `${Math.random() * 100}%`,
        size: 4 + Math.random() * 10,
        delay: `${Math.random() * 6}s`,
        duration: `${7 + Math.random() * 8}s`,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    []
  );

  // Smoothly fill progress from 0 to 100 over the full display window, then
  // fade out and reveal the app.
  useEffect(() => {
    let raf;
    const start = performance.now();

    const tick = (now) => {
      const pct = Math.min(100, ((now - start) / DISPLAY_MS) * 100);
      setProgress(pct);

      if (pct >= 100) {
        if (!finishedRef.current) {
          finishedRef.current = true;
          setLeaving(true);
          setTimeout(() => onFinish?.(), FADE_OUT_MS);
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`splash-root fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden ${
        leaving ? "splash-leaving" : ""
      }`}
    >
      {/* Animated gradient background */}
      <div className="splash-bg absolute inset-0" />

      {/* Soft moving glow shapes */}
      <div className="splash-shape splash-shape-1" />
      <div className="splash-shape splash-shape-2" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <span
            key={i}
            className="splash-particle"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Logo in a glowing glass ring */}
        <div className="splash-logo-wrap">
          <div className="splash-logo-glow" />
          <div className="splash-logo-ring">
            <img
              src={logo}
              alt="AlBuraq Global logo"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
            />
          </div>
        </div>

        {/* Company name */}
        <h1 className="splash-title mt-8 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          AlBuraq Global
        </h1>
        <p className="splash-subtitle mt-2 text-sm sm:text-base font-semibold tracking-[0.3em] text-yellow-400/90">
          TRAVEL &amp; TOURS PVT LTD
        </p>

        {/* Tagline */}
        <p className="splash-tagline mt-4 text-sm sm:text-base italic text-blue-100/70">
          Crafting Unforgettable Journeys
        </p>

        {/* Loading bar + percentage */}
        <div className="splash-loader mt-10 w-64 sm:w-80">
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="splash-bar h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] tracking-wider text-blue-100/60">
            <span>Loading your experience</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
