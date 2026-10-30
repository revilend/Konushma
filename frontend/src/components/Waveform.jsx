import { useEffect, useRef } from "react";

export default function Waveform({ getAnalyser, active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    let t = 0;

    const draw = () => {
      const w = (canvas.width = canvas.offsetWidth * 2);
      const h = (canvas.height = canvas.offsetHeight * 2);
      ctx2d.clearRect(0, 0, w, h);

      const analyser = getAnalyser();
      let bins = null;
      if (analyser) {
        bins = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(bins);
      }

      const bars = 48;
      const gap = w / bars;
      for (let i = 0; i < bars; i++) {
        let v;
        if (bins && active) {
          const idx = Math.floor((i / bars) * (bins.length * 0.4));
          v = bins[idx] / 255;
        } else {
          v = (Math.sin(t / 14 + i / 3) + 1) / 2;
          v = active ? v * 0.4 : v * 0.08 + 0.03;
        }
        const bh = Math.max(h * 0.06, v * h * 0.85);
        const x = i * gap + gap * 0.18;
        const y = (h - bh) / 2;
        const grad = ctx2d.createLinearGradient(x, y, x, y + bh);
        grad.addColorStop(0, "#818cf8");
        grad.addColorStop(1, "#34d399");
        ctx2d.fillStyle = grad;
        ctx2d.beginPath();
        ctx2d.roundRect(x, y, gap * 0.64, bh, gap * 0.3);
        ctx2d.fill();
      }

      t++;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [getAnalyser, active]);

  return <canvas ref={canvasRef} className="wave-canvas h-14 w-full" />;
}
