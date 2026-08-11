export function isInViewport(el: HTMLElement, margin = 48): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight - margin && rect.bottom > margin;
}

export function shouldSkipEnterAnimations(): boolean {
  if (typeof window === "undefined") return false;
  const nav = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming | undefined;
  return nav?.type === "reload";
}
