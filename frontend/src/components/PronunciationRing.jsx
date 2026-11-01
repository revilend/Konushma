export default function PronunciationRing({ score = 0, size = 76, label = "Talaffuz", showLabel = true }) {
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  const angle = (value / 100) * 360;
  const [from, to] =
    value >= 85
      ? ["#6ee7b7", "#fde68a"]
      : value >= 70
        ? ["#fcd34d", "#fda4af"]
        : ["#fb7185", "#fcd34d"];
  const tone = `conic-gradient(from 180deg, ${from} 0deg, ${to} ${angle}deg, rgba(255,255,255,.075) ${angle}deg 360deg)`;

  return (
    <div
      className="pron-ring"
      style={{ width: size, height: size }}
      aria-label={`${label || "Talaffuz"}: ${value}%`}
      role="img"
    >
      <div className="pron-ring-fill" style={{ background: tone, width: size, height: size }}>
        <div className="pron-ring-hole">
          <strong>{value}%</strong>
          {showLabel && <span>{label}</span>}
        </div>
      </div>
    </div>
  );
}
