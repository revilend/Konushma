import Icon from "./Icons";

const MODES = [
  {
    id: "free",
    icon: "message",
    accent: "mint",
    title: "Serbest Sohbet",
    subtitle: "Erkin suhbat",
    desc: "Aylin Hoca bilan istalgan mavzuda, tanlangan darajada erkin mashq qiling.",
    action: "Hozir mashq qilish",
  },
  {
    id: "roleplay",
    icon: "bag",
    accent: "amber",
    title: "Rol Oyunu",
    subtitle: "Real vaziyatlar",
    desc: "Kafe, Kapalıçarşı, havalimanı va otel stsenariylarida jonli suhbat.",
    action: "Stsenariyni tanlash",
  },
  {
    id: "exam",
    icon: "graduation",
    accent: "sky",
    title: "TÖMER Konuşma",
    subtitle: "Imtihon simulyatsiyasi",
    desc: "3 bosqichli rasmiy imtihon va 100 ballik yakuniy baholash kartasi.",
    action: "Imtihonni boshlash",
  },
];

export default function ModePicker({ active = "free", onFree, onRoleplay, onExam }) {
  const handlers = { free: onFree, roleplay: onRoleplay, exam: onExam };

  return (
    <section aria-label="Suhbat rejimlari" className="mb-5 sm:mb-6">
      <div className="mb-2.5 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="eyebrow">3 ta rejim</p>
          <h2 className="mt-1 text-[16px] font-semibold tracking-[-0.025em] text-zinc-100 sm:text-[18px]">
            Qanday mashq qilamiz?
          </h2>
        </div>
        <span className="hidden text-[10px] text-zinc-600 sm:block">Daraja barcha rejimlarda qo&apos;llanadi</span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        {MODES.map((mode) => {
          const selected = active === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={handlers[mode.id]}
              aria-pressed={selected}
              className={`mode-card mode-card-${mode.accent} group relative overflow-hidden rounded-2xl border p-3.5 text-left transition ${
                selected
                  ? "border-mint-300/30 bg-white/[0.07]"
                  : "border-white/[0.075] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.045]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`mode-icon mode-icon-${mode.accent}`}>
                  <Icon name={mode.icon} size={15} />
                </span>
                <span className={`grid h-5 w-5 place-items-center rounded-full border transition ${
                  selected
                    ? "border-mint-300 bg-mint-300 text-emerald-950"
                    : "border-white/10 text-zinc-600 group-hover:border-white/20 group-hover:text-zinc-300"
                }`}>
                  <Icon name={selected ? "check" : "arrowRight"} size={10} strokeWidth={2.2} />
                </span>
              </div>
              <p className="mt-3 text-[13px] font-semibold tracking-tight text-zinc-100">{mode.title}</p>
              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.13em] text-zinc-600">{mode.subtitle}</p>
              <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-zinc-500">{mode.desc}</p>
              <p className={`mt-2.5 text-[10px] font-semibold ${selected ? "text-mint-200" : "text-zinc-500"}`}>
                {selected ? "Tanlangan rejim" : mode.action}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
