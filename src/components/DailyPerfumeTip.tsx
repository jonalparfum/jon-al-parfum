import { getDailyPerfumeTip, getDayOfYear } from "@/lib/perfumeTips";

type DailyPerfumeTipProps = {
  className?: string;
};

export default function DailyPerfumeTip({ className = "" }: DailyPerfumeTipProps) {
  const tip = getDailyPerfumeTip();
  const dayOfYear = getDayOfYear();

  return (
    <div
      className={`animate-fade-in-up border border-gold/15 bg-luxury-panel/40 backdrop-blur-sm px-5 py-4 md:px-6 md:py-5 gold-border-glow ${className}`}
      style={{ animationDelay: "120ms" }}
    >
      <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70 mb-2">
        Consejo del día · {dayOfYear}/365
      </p>
      <p className="text-sm md:text-base text-cream/80 leading-relaxed font-light">
        {tip.replace(/^Día \d+: /, "").replace(/^Tip \d+: /, "")}
      </p>
    </div>
  );
}
