"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ProductImage from "@/components/ProductImage";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  category?: string;
};

const SWIPE_THRESHOLD = 40;
const TRANSITION_MS = 280;

export type SwipeImageTrackHandle = {
  slideNext: () => void;
  slidePrev: () => void;
};

type SwipeImageTrackProps = {
  images: string[];
  alt: string;
  category?: string;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onTap?: () => void;
  onSwipe?: () => void;
  variant: "main" | "lightbox";
  priority?: boolean;
};

const SwipeImageTrack = forwardRef<SwipeImageTrackHandle, SwipeImageTrackProps>(
  function SwipeImageTrack(
    {
      images,
      alt,
      category,
      activeIndex,
      onIndexChange,
      onTap,
      onSwipe,
      variant,
      priority = false,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const startRef = useRef({ x: 0, y: 0 });
    const draggingRef = useRef(false);
    const horizontalRef = useRef<boolean | null>(null);
    const dragXRef = useRef(0);
    const pendingDirectionRef = useRef<1 | -1 | null>(null);

    const [dragX, setDragX] = useState(0);
    const [enableTransition, setEnableTransition] = useState(false);

    const count = images.length;
    const canSwipe = count > 1;

    const wrapIndex = useCallback(
      (index: number) => (index + count) % count,
      [count]
    );

    const getWidth = useCallback(
      () => containerRef.current?.offsetWidth ?? 0,
      []
    );

    const finishSlide = useCallback(
      (direction: 1 | -1) => {
        if (!canSwipe) return;

        const nextIndex = wrapIndex(activeIndex + direction);
        const isWrap =
          direction === 1
            ? activeIndex === count - 1
            : activeIndex === 0;

        if (isWrap) {
          onSwipe?.();
          onIndexChange(nextIndex);
          dragXRef.current = 0;
          setDragX(0);
          setEnableTransition(false);
          return;
        }

        const width = getWidth();
        if (!width) {
          onIndexChange(nextIndex);
          return;
        }

        onSwipe?.();
        pendingDirectionRef.current = direction;
        setEnableTransition(true);
        const targetX = direction === 1 ? -width : width;
        dragXRef.current = targetX;
        setDragX(targetX);
      },
      [activeIndex, canSwipe, count, getWidth, onIndexChange, onSwipe, wrapIndex]
    );

    const snapBack = useCallback(() => {
      pendingDirectionRef.current = null;
      setEnableTransition(true);
      dragXRef.current = 0;
      setDragX(0);
    }, []);

    useImperativeHandle(ref, () => ({
      slideNext: () => finishSlide(1),
      slidePrev: () => finishSlide(-1),
    }));

    useEffect(() => {
      const el = containerRef.current;
      if (!el || !canSwipe) return;

      const onTouchStart = (e: TouchEvent) => {
        draggingRef.current = true;
        horizontalRef.current = null;
        pendingDirectionRef.current = null;
        startRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        setEnableTransition(false);
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!draggingRef.current) return;

        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const dx = x - startRef.current.x;
        const dy = y - startRef.current.y;

        if (horizontalRef.current === null) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          horizontalRef.current = Math.abs(dx) > Math.abs(dy);
        }

        if (!horizontalRef.current) return;

        e.preventDefault();

        let offsetX = dx;
        if (activeIndex === 0 && offsetX > 0) offsetX *= 0.35;
        if (activeIndex === count - 1 && offsetX < 0) offsetX *= 0.35;

        dragXRef.current = offsetX;
        setDragX(offsetX);
      };

      const onTouchEnd = () => {
        if (!draggingRef.current) return;
        draggingRef.current = false;

        const dx = dragXRef.current;
        const atStart = activeIndex === 0 && dx > 0;
        const atEnd = activeIndex === count - 1 && dx < 0;

        if (
          Math.abs(dx) >= SWIPE_THRESHOLD &&
          horizontalRef.current &&
          !atStart &&
          !atEnd
        ) {
          if (dx < 0) finishSlide(1);
          else finishSlide(-1);
        } else if (horizontalRef.current) {
          snapBack();
        }

        horizontalRef.current = null;
      };

      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchmove", onTouchMove, { passive: false });
      el.addEventListener("touchend", onTouchEnd, { passive: true });
      el.addEventListener("touchcancel", onTouchEnd, { passive: true });

      return () => {
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchmove", onTouchMove);
        el.removeEventListener("touchend", onTouchEnd);
        el.removeEventListener("touchcancel", onTouchEnd);
      };
    }, [activeIndex, canSwipe, count, finishSlide, snapBack]);

    const handleTransitionEnd = () => {
      if (!enableTransition) return;

      const direction = pendingDirectionRef.current;
      if (direction) {
        onIndexChange(wrapIndex(activeIndex + direction));
      }

      pendingDirectionRef.current = null;
      dragXRef.current = 0;
      setEnableTransition(false);
      setDragX(0);
    };

    const handleClick = () => {
      if (Math.abs(dragXRef.current) > 8 || draggingRef.current) return;
      onTap?.();
    };

    const trackStyle: React.CSSProperties = {
      transform: `translateX(calc(-${activeIndex * 100}% + ${dragX}px))`,
      transition: enableTransition
        ? `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
        : "none",
    };

    return (
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden ${
          variant === "main" ? "rounded-sm" : "h-full pointer-events-auto"
        }`}
        onClick={onTap ? handleClick : undefined}
      >
        <div
          className="flex h-full w-full"
          style={trackStyle}
          onTransitionEnd={handleTransitionEnd}
        >
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="h-full w-full flex-shrink-0"
            >
              {variant === "main" ? (
                <ProductImage
                  src={image}
                  alt={alt}
                  category={category}
                  className="aspect-[3/4] max-h-[600px] rounded-sm w-full"
                  priority={priority && index === activeIndex}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-12 sm:px-20 py-16">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={alt}
                    className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain select-none"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default function ProductGallery({
  images,
  alt,
  category,
}: ProductGalleryProps) {
  const gallery = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mainTrackRef = useRef<SwipeImageTrackHandle>(null);
  const lightboxTrackRef = useRef<SwipeImageTrackHandle>(null);
  const blockClickRef = useRef(false);
  const blockMainClickRef = useRef(false);
  const activeImage = gallery[activeIndex] || gallery[0] || "";

  const openLightbox = (index?: number) => {
    if (index !== undefined) setActiveIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const blockMainSwipe = useCallback(() => {
    blockMainClickRef.current = true;
    window.setTimeout(() => {
      blockMainClickRef.current = false;
    }, 350);
  }, []);

  const blockLightboxSwipe = useCallback(() => {
    blockClickRef.current = true;
    window.setTimeout(() => {
      blockClickRef.current = false;
    }, 350);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        lightboxTrackRef.current?.slideNext();
      } else if (e.key === "ArrowLeft") {
        lightboxTrackRef.current?.slidePrev();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, closeLightbox]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (blockClickRef.current) return;
    if (e.target === e.currentTarget) closeLightbox();
  };

  const mainImage =
    gallery.length > 1 ? (
      <div className="relative w-full">
        <SwipeImageTrack
          ref={mainTrackRef}
          images={gallery}
          alt={alt}
          category={category}
          activeIndex={activeIndex}
          onIndexChange={setActiveIndex}
          onTap={() => {
            if (!blockMainClickRef.current) openLightbox();
          }}
          onSwipe={blockMainSwipe}
          variant="main"
          priority
        />
        <p className="absolute bottom-3 right-3 z-10 text-[10px] uppercase tracking-widest text-cream/70 bg-black/50 px-2 py-1 rounded-sm pointer-events-none">
          {activeIndex + 1} / {gallery.length}
        </p>
        <span className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 hover:opacity-100 transition-opacity pointer-events-none max-sm:hidden">
          <span className="text-[10px] uppercase tracking-widest text-cream/80 bg-black/60 px-3 py-1.5 rounded-sm border border-gold/20">
            Ampliar
          </span>
        </span>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => openLightbox()}
        className="group relative w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
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
                  lightboxTrackRef.current?.slidePrev();
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
                  lightboxTrackRef.current?.slideNext();
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

          {gallery.length > 1 ? (
            <SwipeImageTrack
              ref={lightboxTrackRef}
              images={gallery}
              alt={alt}
              activeIndex={activeIndex}
              onIndexChange={setActiveIndex}
              onSwipe={blockLightboxSwipe}
              variant="lightbox"
            />
          ) : (
            <div className="relative flex items-center justify-center w-full h-full px-12 sm:px-20 py-16 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={alt}
                className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain select-none pointer-events-auto"
                draggable={false}
              />
            </div>
          )}

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
