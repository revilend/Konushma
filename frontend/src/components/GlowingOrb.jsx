/**
 * Golografik ovoz shari — ChatGPT Voice / Siri uslubida.
 * mode: idle | listening | thinking | speaking | muted
 */
export default function GlowingOrb({ mode = "idle", size = "lg" }) {
  const active = mode === "speaking" || mode === "listening";
  return (
    <div
      className={`orb-stage orb-${mode} ${size === "sm" ? "orb-sm" : ""}`}
      aria-hidden="true"
    >
      <span className="orb-halo" />
      <span className="orb-ring orb-ring-1" />
      <span className="orb-ring orb-ring-2" />
      <span className="orb-core" />
      {active && <span className="orb-spark" />}
    </div>
  );
}
