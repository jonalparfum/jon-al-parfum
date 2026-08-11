type LoadingSpinnerProps = {
  className?: string;
};

export default function LoadingSpinner({
  className = "w-3 h-3",
}: LoadingSpinnerProps) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin ${className}`}
      aria-hidden="true"
    />
  );
}
