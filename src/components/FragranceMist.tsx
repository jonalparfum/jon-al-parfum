type FragranceMistProps = {
  className?: string;
  variant?: "hero" | "section";
};

export default function FragranceMist({
  className = "",
  variant = "hero",
}: FragranceMistProps) {
  if (variant === "section") {
    return (
      <div
        className={`fragrance-mist fragrance-mist-section pointer-events-none absolute inset-0 overflow-hidden ${className}`}
        aria-hidden="true"
      >
        <div className="fragrance-glow" />
      </div>
    );
  }

  return (
    <div
      className={`fragrance-mist fragrance-mist-hero pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="fragrance-glow" />
      <span className="fragrance-particle fragrance-particle-a" />
      <span className="fragrance-particle fragrance-particle-b" />
    </div>
  );
}
