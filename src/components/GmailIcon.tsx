type GmailIconProps = {
  className?: string;
};

export default function GmailIcon({ className = "w-5 h-5" }: GmailIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.548l8.073-6.055C21.69 2.234 24 3.389 24 5.457z"
      />
      <path
        fill="#FBBC04"
        d="m12 9.548 8.073-6.055C21.69 2.234 24 3.389 24 5.457v.364L12 9.548z"
      />
      <path
        fill="#34A853"
        d="M12 9.548 3.927 3.493C2.309 2.278 0 3.433 0 5.457v.364L12 9.548z"
      />
      <path
        fill="#4285F4"
        d="M0 5.821v13.545c0 .904.732 1.636 1.636 1.636h3.819V11.73L12 16.64V9.548L0 5.821z"
      />
      <path
        fill="#C5221F"
        d="M12 16.64 6.455 11.73v9.273h3.819V16.64H12z"
      />
    </svg>
  );
}
