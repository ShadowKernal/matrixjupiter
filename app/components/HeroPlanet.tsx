"use client";

import dynamic from "next/dynamic";
import { RefObject, useEffect, useRef, useState } from "react";

const HeroPlanetScene = dynamic(() => import("./HeroPlanetScene"), {
  ssr: false,
});

type HeroPlanetProps = {
  heroRef: RefObject<HTMLElement | null>;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function HeroPlanet({ heroRef }: HeroPlanetProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    const attach = (query: MediaQueryList) => {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    };

    update();
    const detachReduced = attach(reducedMotionQuery);

    return () => {
      detachReduced();
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "200px 0px 200px 0px",
      }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroRef]);

  useEffect(() => {
    const hero = heroRef.current;
    const layer = layerRef.current;
    if (!hero || !layer) return;

    const applyProgress = (nextProgress: number) => {
      const fade = 1 - clamp((nextProgress - 0.68) / 0.32, 0, 1);
      const shiftY = nextProgress * 72;
      const shiftX = -nextProgress * 34;
      const scale = 1 - nextProgress * 0.06;
      const tilt = nextProgress * 6;
      progressRef.current = nextProgress;

      layer.style.setProperty("--planet-progress", nextProgress.toFixed(4));
      layer.style.setProperty("--planet-fade", fade.toFixed(4));
      layer.style.setProperty("--planet-shift-y", `${shiftY.toFixed(2)}px`);
      layer.style.setProperty("--planet-shift-x", `${shiftX.toFixed(2)}px`);
      layer.style.setProperty("--planet-scale", scale.toFixed(4));
      layer.style.setProperty("--planet-tilt", tilt.toFixed(2));
    };

    const updateFromRect = () => {
      const rect = hero.getBoundingClientRect();
      const nextProgress = clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
      applyProgress(nextProgress);
    };

    updateFromRect();

    if (!isInView) return;

    if (prefersReducedMotion) {
      const onScroll = () => updateFromRect();
      const onResize = () => updateFromRect();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
      };
    }

    let frame = 0;
    const tick = () => {
      updateFromRect();
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [heroRef, isInView, prefersReducedMotion]);

  return (
    <div className="hero-planet-layer" ref={layerRef} aria-hidden="true">
      <div className="hero-planet-canvas">
        <HeroPlanetScene progressRef={progressRef} />
      </div>
    </div>
  );
}
