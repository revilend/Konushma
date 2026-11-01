import { useMissions } from "../lib/missions";
import Icon from "./Icons";

const fmtSeconds = (seconds) => {
  const value = Math.round(seconds);
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
};

export default function MissionsCard() {
  const { missions, completed, total } = useMissions();
  const allDone = completed === total;

  return (
    <section className={`missions-card surface overflow-hidden rounded-3xl ${allDone ? "missions-done" : ""}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-300/10 text-amber-200">
            <Icon name="flame" size={13} />
          </span>
          <div>
            <h3 className="text-[12px] font-semibold text-zinc-100">Kunlik missiyalar</h3>
            <p className="text-[9px] text-zinc-500">Bugun uchun kichik maqsadlar</p>
          </div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${allDone ? "bg-mint-300/15 text-mint-200" : "bg-white/[0.05] text-zinc-400"}`}>
          {completed}/{total}
        </span>
      </div>

      <div className="divide-y divide-white/[0.045]">
        {missions.map((mission) => (
          <div key={mission.key} className="flex items-center gap-2.5 px-4 py-2.5">
            <span className={`mission-icon mission-icon-${mission.accent}`}>
              <Icon name={mission.icon} size={12} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className={`truncate text-[11px] font-medium ${mission.done ? "text-zinc-400" : "text-zinc-200"}`}>
                  {mission.title}
                </p>
                {mission.done && <Icon name="check" size={10} className="shrink-0 text-mint-300" />}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className={`mission-bar mission-bar-${mission.accent}`} style={{ width: `${Math.max(3, mission.progress)}%` }} />
                </div>
                <span className="shrink-0 text-[9px] tabular-nums text-zinc-600">
                  {mission.unit === "seconds"
                    ? `${fmtSeconds(mission.value)} / ${fmtSeconds(mission.target)}`
                    : `${Math.min(mission.value, mission.target)}/${mission.target}`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {allDone && (
        <div className="border-t border-mint-300/10 bg-mint-300/[0.06] px-4 py-2 text-center text-[9px] font-medium text-mint-200">
          Bugungi barcha missiyalar bajarildi
        </div>
      )}
    </section>
  );
}
