"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductImage from "@/components/ProductImage";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  category?: string;
};

const SWIPE_THRESHOLD = 40;

function attachSwipeNavigation(
  el: HTMLElement,
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  onSwipe?: () => void
) {
  let startX = 0;
  let startY = 0;

  const onTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (
      Math.abs(deltaX) < SWIPE_THRESHOLD ||
      Math.abs(deltaX) < Math.abs(deltaY)
    ) {
      return;
    }

    onSwipe?.();
    if (deltaX < 0) onSwipeLeft();
    else onSwipeRight();
  };

  el.addEventListener("touchstart", onTouchStart, { passive: true });
  el.addEventListener("touchend", onTouchEnd, { passive: true });

  return () => {
    el.removeEventListener("touchstart", onTouchStart);
    el.removeEventListener("touchend", onTouchEnd);
  };
}

export default function ProductGallery({
  images,
  alt,
  category,
}: ProductGalleryProps) {
  const gallery = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const mainGalleryRef = useRef<HTMLDivElement>(null);
  const blockClickRef = useRef(false);
  const blockMainClickRef = useRef(false);
  const activeImage = gallery[activeIndex] || gallery[0] || "";

  const goNext = useCallback(() => {
    if (gallery.length <= 1) return;
    setActiveIndex((i) => (i + 1) % gallery.length);
  }, [gallery.length]);

  const goPrev = useCallback(() => {
    if (gallery.length <= 1) return;
    setActiveIndex((i) => (i - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  const openLightbox = (index?: number) => {
    if (index !== undefined) setActiveIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, closeLightbox, goNext, goPrev]);

  useEffect(() => {
    if (gallery.length <= 1) return;

    const el = mainGalleryRef.current;
    if (!el) return;

    return attachSwipeNavigation(
      el,
      goNext,
      goPrev,
      () => {
        blockMainClickRef.current = true;
        window.setTimeout(() => {
          blockMainClickRef.current = false;
        }, 350);
      }
    );
  }, [gallery.length, goNext, goPrev]);

  useEffect(() => {
    if (!lightboxOpen || gallery.length <= 1) return;

    const el = lightboxRef.current;
    if (!el) return;

    return attachSwipeNavigation(
      el,
      goNext,
      goPrev,
      () => {
        blockClickRef.current = true;
        window.setTimeout(() => {
          blockClickRef.current = false;
        }, 350);
      }
    );
  }, [lightboxOpen, gallery.length, goNext, goPrev]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (blockClickRef.current) return;
    if (e.target === e.currentTarget) closeLightbox();
  };

  const mainImage = (
    <div ref={gallery.length > 1 ? mainGalleryRef : undefined} className="relative w-full">
      <button
        type="button"
        onClick={() => {
          if (!blockMainClickRef.current) openLightbox();
        }}
        className="group relative w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm touch-pan-y"
        aria-label="Ampliar imagen del producto"
      >
        <ProductImage
          src={activeImage}
          alt={alt}
          category={category}
          className="aspect-[3/4] max-h-[600px] rounded-sm"
          priority
        />
        <span className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest text-cream/80 bg-black/60 px-3 py-1.5 rounded-sm border border-gold/20">
            Ampliar
          </span>
        </span>
      </button>
      {gallery.length > 1 && (
        <p className="absolute bottom-3 right-3 text-[10px] uppercase tracking-widest text-cream/70 bg-black/50 px-2 py-1 rounded-sm pointer-events-none">
          {activeIndex + 1} / {gallery.length}
        </p>
      )}
    </div>
  );

  return (
    <>
      {gallery.length <= 1 ? (
        mainImage
      ) : (
        <div className="space-y-4">
          {mainImage}
          <div className="flex flex-wrap gap-2">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  openLightbox(index);
                }}
                className={`relative w-16 h-20 overflow-hidden rounded border transition-colors cursor-pointer ${
                  index === activeIndex
                    ? "border-gold"
                    : "border-gold/20 hover:border-gold/50"
                }`}
                aria-label={`Ver imagen ${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {lightboxOpen && activeImage && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black"
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de ${alt}`}
          onClick={handleBackdropClick}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!blockClickRef.current) closeLightbox();
            }}
            className="absolute top-4 right-4 z-10 p-2 text-cream/70 hover:text-gold transition-colors"
            aria-label="Cerrar visor"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-2 sm:left-4 z-10 p-2 sm:p-3 text-cream/70 hover:text-gold transition-colors"
                aria-label="Imagen anterior"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-2 sm:right-4 z-10 p-2 sm:p-3 text-cream/70 hover:text-gold transition-colors"
                aria-label="Imagen siguiente"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative flex items-center justify-center w-full h-full px-12 sm:px-20 py-16 pointer-events-none"
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage}
              alt={alt}
              className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain select-none pointer-events-auto touch-pan-y"
              draggable={false}
            />
          </div>

          {gallery.length > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-gold/70 pointer-events-none">
              {activeIndex + 1} / {gallery.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
