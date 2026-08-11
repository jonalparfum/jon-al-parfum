type FragranceMistProps = {
  intensity?: "subtle" | "medium" | "rich";
  className?: string;
};

const PARTICLE_COUNT = {
  subtle: 6,
  medium: 10,
  rich: 14,
};

const WISP_COUNT = {
  subtle: 2,
  medium: 3,
  rich: 4,
};

export default function FragranceMist({
  intensity = "medium",
  className = "",
}: FragranceMistProps) {
  const count = PARTICLE_COUNT[intensity];
  const wispCount = WISP_COUNT[intensity];

  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 37 + 11) % 100}%`,
    delay: `${(i * 0.18) % 1.2}s`,
    duration: `${2.8 + (i % 3) * 0.6}s`,
    size: 4 + (i % 5) * 2,
    opacity: 0.22 + (i % 4) * 0.08,
  }));

  const wisps = Array.from({ length: wispCount }, (_, i) => ({
    id: i,
    left: `${12 + i * 22}%`,
    delay: `${i * 0.35}s`,
  }));

  return (
    <div
      className={`fragrance-mist pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="fragrance-glow absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-40" />

      {wisps.map((w) => (
        <span
          key={`wisp-${w.id}`}
          className={`fragrance-wisp absolute bottom-[10%] ${w.id >= 2 ? "hidden md:block" : ""}`}
          style={{
            left: w.left,
            animationDelay: w.delay,
          }}
        />
      ))}

      {particles.map((p) => (
        <span
          key={p.id}
          className={`fragrance-particle absolute bottom-0 rounded-full ${p.id >= 7 ? "hidden md:block" : ""}`}
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
    </div>
  );
}
