import { useEffect, useRef } from "react";

/**
 * Jonli ovoz to'lqini.
 * mode: "speaking" — Aylin gapirayotganda mayin sintetik to'lqin (yashil);
 *       "listening" — mikrofon kuchiga qarab balandlik va rang o'zgaradi;
 *       "idle" — sokin holat.
 */
export default function Waveform({ getAnalyser, active = false, mode = "idle" }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const smoothRef = useRef([]);
  const levelRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    const bars = 56;
    if (smoothRef.current.length !== bars) smoothRef.current = new Array(bars).fill(0);
    let t = 0;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = (canvas.width = Math.max(1, canvas.offsetWidth * dpr));
      const h = (canvas.height = Math.max(1, canvas.offsetHeight * dpr));
      ctx2d.clearRect(0, 0, w, h);
      ctx2d.shadowBlur = mode === "speaking" ? 22 : 10;
      ctx2d.shadowColor = mode === "speaking" ? "rgba(16,185,129,0.45)" : "rgba(99,102,241,0.35)";

      const analyser = getAnalyser?.();
      let bins = null;
      if (analyser && mode === "listening") {
        bins = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(bins);
      }

      let level = 0;
      if (bins) {
        for (let i = 0; i < bins.length; i++) level += bins[i];
        level = level / bins.length / 255;
      }
      levelRef.current = levelRef.current * 0.75 + level * 0.25;
      const liveLevel = levelRef.current;

      const gap = w / bars;
      const center = h / 2;
      const envelope = (i) => {
        const x = i / (bars - 1);
        return Math.sin(Math.PI * x) ** 0.7;
      };

      for (let i = 0; i < bars; i++) {
        let v;
        if (mode === "speaking" && active) {
          // Mayin, nafas olayotgan ovoz to'lqini
          v =
            0.34 +
            0.22 * Math.sin(t * 0.09 + i * 0.42) +
            0.14 * Math.sin(t * 0.16 + i * 0.87) +
            0.08 * Math.sin(t * 0.05 + i * 1.7);
          v = Math.max(0.12, Math.min(1, v)) * envelope(i);
        } else if (mode === "listening" && bins) {
          const idx = Math.floor((i / bars) * (bins.length * 0.45));
          v = (bins[idx] / 255) * 1.25 * envelope(i);
        } else {
          v = (0.05 + 0.04 * Math.sin(t * 0.05 + i * 0.3)) * envelope(i);
        }

        const prev = smoothRef.current[i] || 0;
        const eased = prev + (v - prev) * (mode === "listening" ? 0.45 : 0.18);
        smoothRef.current[i] = eased;

        const bh = Math.max(h * 0.045, eased * h * 0.9);
        const x = i * gap + gap * 0.2;
        const y = center - bh / 2;
        const barW = gap * 0.6;

        let hue;
        if (mode === "speaking") hue = 158 + 26 * Math.sin(t * 0.04 + i * 0.15);
        else if (mode === "listening") hue = 205 - liveLevel * 160;
        else hue = 222;

        const grad = ctx2d.createLinearGradient(x, y, x, y + bh);
        grad.addColorStop(0, `hsl(${hue} 90% 62%)`);
        grad.addColorStop(1, `hsl(${hue + 42} 88% 55%)`);
        ctx2d.fillStyle = grad;
        ctx2d.beginPath();
        const r = Math.min(barW / 2, gap * 0.3);
        ctx2d.roundRect(x, y, barW, bh, r);
        ctx2d.fill();
      }

      t++;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [getAnalyser, active, mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`wave-canvas h-16 w-full sm:h-20 ${mode === "speaking" ? "opacity-100" : "opacity-90"}`}
    />
  );
}
