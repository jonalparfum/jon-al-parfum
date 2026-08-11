/** Shared Tailwind classes for the admin panel (dark luxury theme). */

export const adminPageTitle =
  "font-display text-2xl md:text-3xl text-cream tracking-wide";
export const adminSectionTitle = "font-medium text-lg text-cream mb-1";
export const adminMuted = "text-sm text-cream/50";
export const adminSubtitle = "text-sm text-cream/55 mt-1 max-w-2xl";

export const adminShell =
  "min-h-screen bg-luxury-black text-cream flex";
export const adminSidebar =
  "w-64 shrink-0 border-r border-gold/10 bg-luxury-panel/40 flex flex-col";
export const adminSidebarMobile =
  "fixed inset-y-0 left-0 z-50 w-72 border-r border-gold/10 bg-luxury-panel shadow-2xl flex flex-col md:hidden";
export const adminMain = "flex-1 min-w-0 flex flex-col";
export const adminTopbar =
  "sticky top-0 z-20 border-b border-gold/10 bg-luxury-black/90 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between gap-4";
export const adminContent = "flex-1 px-4 md:px-8 py-6 md:py-8";

export const adminPanel =
  "bg-luxury-panel/80 border border-gold/10 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.25)]";
export const adminPanelPadding =
  "bg-luxury-panel/80 border border-gold/10 rounded-xl p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)]";
export const adminCard =
  "bg-luxury-panel/60 border border-gold/10 rounded-xl p-5 hover:border-gold/20 transition-colors";
export const adminStatCard =
  "bg-luxury-panel/80 border border-gold/10 rounded-xl p-4 md:p-5 hover:border-gold/25 hover:bg-luxury-panel transition-all";
export const adminStatLabel =
  "text-[10px] uppercase tracking-[0.18em] text-cream/45";
export const adminStatValue = "text-2xl md:text-3xl font-semibold text-gold mt-1.5";

export const adminToolbar =
  "flex flex-col lg:flex-row lg:items-center gap-3 mb-6 p-4 md:p-5 rounded-xl border border-gold/10 bg-luxury-panel/50";
export const adminFilterGroup = "flex flex-wrap items-center gap-2";
export const adminFilterPill =
  "px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.12em] border transition-colors";
export const adminFilterPillActive =
  "bg-gold text-luxury-black border-gold font-medium";
export const adminFilterPillInactive =
  "bg-luxury-black/40 text-cream/65 border-gold/15 hover:border-gold/35 hover:text-gold";

export const adminBtnPrimary =
  "inline-flex items-center justify-center gap-2 bg-gold text-luxury-black px-4 py-2.5 rounded-lg text-[11px] uppercase tracking-[0.14em] font-semibold hover:bg-gold-light transition-colors disabled:opacity-50";
export const adminBtnGhost =
  "inline-flex items-center justify-center gap-2 border border-gold/30 text-gold px-4 py-2.5 rounded-lg text-[11px] uppercase tracking-[0.14em] hover:bg-gold/10 transition-colors";
export const adminBtnDanger =
  "inline-flex items-center justify-center gap-2 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-[0.12em] hover:bg-red-950/40 transition-colors";
export const adminBtnSuccess =
  "inline-flex items-center justify-center gap-2 border border-green-500/30 text-green-300 px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-[0.12em] hover:bg-green-950/30 transition-colors";

export const adminInput =
  "w-full bg-luxury-black/70 border border-gold/15 rounded-lg px-3 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors";
export const adminLabel = "block text-xs uppercase tracking-[0.12em] mb-1.5 text-cream/65";
export const adminSelect = adminInput;

export const adminTableHead =
  "bg-luxury-black/60 border-b border-gold/10 text-[10px] uppercase tracking-[0.14em] text-gold/75";
export const adminTh = "text-left p-4 font-medium whitespace-nowrap";
export const adminTr =
  "border-b border-gold/5 hover:bg-luxury-black/30 transition-colors";
export const adminTd = "p-4 text-cream/90 align-middle";
export const adminTdMuted = "p-4 text-cream/45 align-middle";

export const adminLink = "text-gold hover:text-gold-light transition-colors text-sm";
export const adminLinkDanger =
  "text-red-400 hover:text-red-300 transition-colors text-sm";

export const adminBadgeFeatured =
  "text-[10px] bg-gold/15 text-gold border border-gold/25 px-2 py-0.5 rounded-full uppercase tracking-wide";
export const adminBadgeNew =
  "text-[10px] bg-blue-900/40 text-blue-200 border border-blue-700/40 px-2 py-0.5 rounded-full uppercase tracking-wide";
export const adminBadgeActive =
  "text-[10px] px-2 py-0.5 rounded-full bg-green-900/40 text-green-300 border border-green-700/40 uppercase tracking-wide";
export const adminBadgeInactive =
  "text-[10px] px-2 py-0.5 rounded-full bg-luxury-muted text-cream/50 border border-gold/10 uppercase tracking-wide";

export const adminEmptyState =
  "py-16 px-6 text-center border border-dashed border-gold/15 rounded-xl bg-luxury-black/20";
export const adminLoading = "text-cream/50 text-sm animate-pulse py-8";
export const adminNavLink =
  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors";
export const adminNavLinkActive =
  "bg-gold/15 text-gold border border-gold/25 font-medium";
export const adminNavLinkInactive =
  "text-cream/60 hover:text-gold hover:bg-gold/5 border border-transparent";

export const adminToast =
  "fixed bottom-6 right-6 z-[100] max-w-sm px-4 py-3 rounded-lg border text-sm shadow-xl animate-in fade-in slide-in-from-bottom-2";
export const adminToastSuccess =
  "bg-green-950/95 border-green-700/40 text-green-100";
export const adminToastError = "bg-red-950/95 border-red-800/40 text-red-100";
