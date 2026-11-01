/**
 * Yumshoq gradientli golografik ovoz shari.
 * mode: idle | listening | thinking | speaking | muted
 */
export default function GlowingOrb({ mode = "idle", size = "lg" }) {
  return (
    <div className={`voice-orb voice-orb-${mode} ${size === "sm" ? "voice-orb-sm" : ""}`} aria-hidden="true">
      <span className="voice-orb-halo" />
      <span className="voice-orb-ring voice-orb-ring-1" />
      <span className="voice-orb-ring voice-orb-ring-2" />
      <span className="voice-orb-ring voice-orb-ring-3" />
      <span className="voice-orb-core" />
    </div>
  );
}
