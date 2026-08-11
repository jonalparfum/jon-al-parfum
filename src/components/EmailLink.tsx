import { CONTACT_EMAIL } from "@/lib/contact";
import { GmailIcon } from "@/components/SocialIcons";

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
        <span className="flex-shrink-0 w-8 h-8 rounded-full border border-gold/25 flex items-center justify-center text-gold">
          <GmailIcon className="w-4 h-4" />
        </span>
      )}
      <span>{CONTACT_EMAIL}</span>
    </a>
  );
}
