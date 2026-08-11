type FragranceMistProps = {
  className?: string;
  variant?: "hero" | "section";
};

export default function FragranceMist({
  className = "",
  variant = "hero",
}: FragranceMistProps) {
  return (
    <div
      className={`fragrance-mist fragrance-mist-${variant} pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="fragrance-glow" />
      <span className="fragrance-wisp fragrance-wisp-a" />
      <span className="fragrance-wisp fragrance-wisp-b hidden sm:block" />
      <span className="fragrance-particle fragrance-particle-a" />
      <span className="fragrance-particle fragrance-particle-b" />
      <span className="fragrance-particle fragrance-particle-c hidden sm:block" />
      <span className="fragrance-particle fragrance-particle-d hidden md:block" />
      <span className="fragrance-particle fragrance-particle-e hidden md:block" />
      <span className="fragrance-particle fragrance-particle-f hidden lg:block" />
    </div>
  );
}
