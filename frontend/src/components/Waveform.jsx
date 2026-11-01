import { useEffect, useRef } from "react";

/**
 * Monoxrom jonli ovoz to'lqini.
 * speaking — Aylin gapirganda sokin sintetik to'lqin;
 * listening — mikrofon kuchiga moslashadi;
 * idle — deyarli tekis.
 */
export default function Waveform({ getAnalyser, active = false, mode = "idle" }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const smoothRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const bars = 56;
    if (smoothRef.current.length !== bars) smoothRef.current = new Array(bars).fill(0);
    let tick = 0;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = (canvas.width = Math.max(1, canvas.offsetWidth * dpr));
      const height = (canvas.height = Math.max(1, canvas.offsetHeight * dpr));
      context.clearRect(0, 0, width, height);
      context.shadowBlur = 0;

      const analyser = getAnalyser?.();
      let bins = null;
      if (analyser && mode === "listening") {
        bins = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(bins);
      }

      const gap = width / bars;
      const center = height / 2;
      const envelope = (index) => Math.sin((Math.PI * index) / (bars - 1)) ** 0.7;

      for (let index = 0; index < bars; index++) {
        let value;
        if (mode === "speaking" && active) {
          value =
            0.32 +
            0.2 * Math.sin(tick * 0.09 + index * 0.42) +
            0.12 * Math.sin(tick * 0.16 + index * 0.87);
          value = Math.max(0.1, Math.min(1, value)) * envelope(index);
        } else if (mode === "listening" && bins) {
          const binIndex = Math.floor((index / bars) * (bins.length * 0.45));
          value = (bins[binIndex] / 255) * 1.2 * envelope(index);
        } else {
          value = (0.045 + 0.03 * Math.sin(tick * 0.05 + index * 0.3)) * envelope(index);
        }

        const previous = smoothRef.current[index] || 0;
        const eased = previous + (value - previous) * (mode === "listening" ? 0.42 : 0.16);
        smoothRef.current[index] = eased;

        const barHeight = Math.max(height * 0.04, eased * height * 0.88);
        const x = index * gap + gap * 0.22;
        const y = center - barHeight / 2;
        const barWidth = gap * 0.56;
        const speaking = mode === "speaking";
        const listening = mode === "listening";
        const stopTop = speaking ? "253, 230, 138" : listening ? "167, 243, 208" : "161, 161, 170";
        const stopBottom = speaking ? "251, 146, 60" : listening ? "94, 234, 212" : "113, 113, 122";
        const alpha = speaking ? 0.9 : listening ? 0.82 : 0.3;

        const gradient = context.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, `rgba(${stopTop}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${stopBottom}, ${alpha * 0.45})`);
        context.fillStyle = gradient;

        context.beginPath();
        const radius = Math.min(barWidth / 2, gap * 0.28);
        context.roundRect(x, y, barWidth, barHeight, radius);
        context.fill();
      }

      tick += 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [getAnalyser, active, mode]);

  return <canvas ref={canvasRef} aria-hidden="true" className="wave-canvas h-full w-full" />;
}
