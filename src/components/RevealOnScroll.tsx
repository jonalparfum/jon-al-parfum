"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { isInViewport, shouldSkipEnterAnimations } from "@/lib/motion";

export default function RevealOnScroll({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      shouldSkipEnterAnimations() ||
      document.documentElement.dataset.skipEnterMotion === "true" ||
      isInViewport(el, 80)
    ) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (visible) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.04, rootMargin: "120px 0px -5% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll opacity-100 transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${className} ${
        visible ? "translate-y-0" : "translate-y-5"
      }`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
