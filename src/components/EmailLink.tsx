import GmailIcon from "@/components/GmailIcon";
import { CONTACT_EMAIL } from "@/lib/contact";

type EmailLinkProps = {
  className?: string;
  showIcon?: boolean;
};

export default function EmailLink({
  className = "",
  showIcon = true,
}: EmailLinkProps) {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className={`inline-flex items-center gap-2.5 hover:text-gold transition-colors duration-300 ${className}`}
    >
      {showIcon && (
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-sm">
          <GmailIcon className="w-4 h-4" />
        </span>
      )}
      <span>{CONTACT_EMAIL}</span>
    </a>
  );
}
