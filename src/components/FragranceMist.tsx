"use client";

type FragranceMistProps = {
  intensity?: "subtle" | "medium" | "rich";
  className?: string;
};

const PARTICLE_COUNT = {
  subtle: 12,
  medium: 20,
  rich: 28,
};

export default function FragranceMist({
  intensity = "medium",
  className = "",
}: FragranceMistProps) {
  const count = PARTICLE_COUNT[intensity];

  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 37 + 11) % 100}%`,
    delay: `${(i * 0.7) % 8}s`,
    duration: `${4 + (i % 5)}s`,
    size: 4 + (i % 6) * 2,
    opacity: 0.15 + (i % 4) * 0.08,
  }));

  const wisps = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: `${10 + i * 16}%`,
    delay: `${i * 1.4}s`,
  }));

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="fragrance-particle absolute bottom-0 rounded-full"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.opacity,
          }}
        />
      ))}

      {wisps.map((w) => (
        <span
          key={`wisp-${w.id}`}
          className="fragrance-wisp absolute bottom-[10%]"
          style={{
            left: w.left,
            animationDelay: w.delay,
          }}
        />
      ))}

      <div className="fragrance-glow absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-30" />
    </div>
  );
}
