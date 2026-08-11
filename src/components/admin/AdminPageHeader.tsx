import {
  adminPageHeader,
  adminPageTitle,
  adminSubtitle,
} from "@/lib/admin-styles";

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function AdminPageHeader({
  title,
  subtitle,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className={adminPageHeader}>
      <div className="min-w-0">
        <h1 className={adminPageTitle}>{title}</h1>
        {subtitle && <p className={adminSubtitle}>{subtitle}</p>}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
