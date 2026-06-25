"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RemoteImage } from "@/shared/components/patterns/remote-image";
import { cn } from "@/shared/lib/utils";

export interface CarouselImage {
  id: string;
  url: string;
  alt?: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  intervalMs?: number;
  className?: string;
  imageAlt?: string;
  dotsClassName?: string;
  arrowsClassName?: string;
  fadeMs?: number;
  controlsVariant?: "on-image" | "on-light";
}

const DEFAULT_INTERVAL_MS = 12_000;
const DEFAULT_FADE_MS = 1_000;

export function ImageCarousel({
  images,
  intervalMs = DEFAULT_INTERVAL_MS,
  className,
  imageAlt = "Imagen",
  dotsClassName,
  arrowsClassName,
  fadeMs = DEFAULT_FADE_MS,
  controlsVariant = "on-image",
}: ImageCarouselProps) {
  const slides = images.filter((image) => image.url?.trim());
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      setActive(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const next = useCallback(() => {
    if (slides.length <= 1) return;
    setActive((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length <= 1) return;
    setActive((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const slideKey = slides.map((slide) => `${slide.id}:${slide.url}`).join("|");

  useEffect(() => {
    setActive(0);
  }, [slideKey]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const id = window.setInterval(next, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs, next, paused]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (slides.length <= 1) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  };

  const arrowButtonClass =
    controlsVariant === "on-light"
      ? "bg-white/95 text-foreground shadow-md hover:bg-white"
      : "bg-black/30 text-white backdrop-blur-sm hover:bg-black/50";

  if (slides.length === 0) return null;

  if (slides.length === 1) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        <RemoteImage src={slides[0].url} alt={slides[0].alt ?? imageAlt} fill />
      </div>
    );
  }

  return (
    <div
      className={cn("group relative h-full w-full overflow-hidden", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Galería de imágenes"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          aria-hidden={index !== active}
          className={cn(
            "absolute inset-0",
            index === active ? "z-10 opacity-100" : "z-0 opacity-0",
          )}
          style={{ transition: `opacity ${fadeMs}ms ease-in-out` }}
        >
          <RemoteImage src={slide.url} alt={slide.alt ?? imageAlt} fill />
        </div>
      ))}

      <button
        type="button"
        aria-label="Imagen anterior"
        onClick={prev}
        className={cn(
          "absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full opacity-90 transition-all hover:opacity-100",
          arrowButtonClass,
          arrowsClassName,
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        aria-label="Imagen siguiente"
        onClick={next}
        className={cn(
          "absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full opacity-90 transition-all hover:opacity-100",
          arrowButtonClass,
          arrowsClassName,
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        className={cn(
          "absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur-sm",
          dotsClassName,
        )}
      >
        <span className="px-1 text-xs font-medium text-white/90">
          {active + 1}/{slides.length}
        </span>
        <div className="flex items-center gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Ver imagen ${index + 1} de ${slides.length}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => goTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-500 ease-in-out",
                index === active ? "w-6 bg-white" : "w-2 bg-white/45 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
