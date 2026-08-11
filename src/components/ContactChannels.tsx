import {
  CONTACT_EMAIL,
  FACEBOOK_URL,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/contact";
import { WhatsAppIcon, FacebookIcon, GmailIcon } from "@/components/SocialIcons";

const channelClass =
  "flex items-center gap-4 p-4 border border-gold/10 bg-luxury-panel/30 hover:border-gold/30 hover:bg-luxury-panel/50 transition-all duration-300 group";

const iconWrapClass =
  "flex-shrink-0 w-10 h-10 rounded-full border border-gold/25 flex items-center justify-center text-gold group-hover:border-gold/50 group-hover:bg-gold/5 group-hover:text-gold-light transition-all duration-300";

type ContactChannelsProps = {
  className?: string;
};

export default function ContactChannels({ className = "" }: ContactChannelsProps) {
  const channels = [
    {
      href: WHATSAPP_URL,
      label: "WhatsApp",
      value: WHATSAPP_DISPLAY,
      external: true,
      icon: <WhatsAppIcon className="w-5 h-5" />,
    },
    {
      href: FACEBOOK_URL,
      label: "Facebook",
      value: "Jon Al Parfum",
      external: true,
      icon: <FacebookIcon className="w-5 h-5" />,
    },
    {
      href: `mailto:${CONTACT_EMAIL}`,
      label: "Gmail",
      value: CONTACT_EMAIL,
      external: false,
      icon: <GmailIcon className="w-5 h-5" />,
    },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {channels.map((channel) => (
        <a
          key={channel.label}
          href={channel.href}
          {...(channel.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className={channelClass}
        >
          <span className={iconWrapClass}>{channel.icon}</span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold/70 mb-0.5">
              {channel.label}
            </p>
            <p className="text-sm text-cream/85 group-hover:text-gold transition-colors duration-300 truncate">
              {channel.value}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
