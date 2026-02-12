"use client";

import dynamic from "next/dynamic";
import { Component, ReactNode, RefObject, useEffect, useRef, useState } from "react";

const HeroPlanetScene = dynamic(() => import("./HeroPlanetScene"), {
  ssr: false,
});

type HeroPlanetProps = {
  heroRef: RefObject<HTMLElement | null>;
};

type PlanetSceneErrorBoundaryProps = {
  children: ReactNode;
};

type PlanetSceneErrorBoundaryState = {
  hasError: boolean;
};

class PlanetSceneErrorBoundary extends Component<
  PlanetSceneErrorBoundaryProps,
  PlanetSceneErrorBoundaryState
> {
  state: PlanetSceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PlanetSceneErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="hero-planet-fallback" aria-hidden="true" />;
    }
    return this.props.children;
  }
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function HeroPlanet({ heroRef }: HeroPlanetProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [dprRange, setDprRange] = useState<[number, number]>([1, 1.65]);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isSceneVisible, setIsSceneVisible] = useState(false);

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
    const updateDprRange = () => {
      const deviceDpr = window.devicePixelRatio || 1;
      const viewportWidth = window.innerWidth;
      const cpuThreads = navigator.hardwareConcurrency || 4;

      let maxDpr = Math.min(deviceDpr, 1.85);
      if (viewportWidth < 1100) maxDpr = Math.min(maxDpr, 1.55);
      if (viewportWidth < 820) maxDpr = Math.min(maxDpr, 1.35);
      if (cpuThreads <= 4) maxDpr = Math.min(maxDpr, 1.3);
      if (prefersReducedMotion) maxDpr = Math.min(maxDpr, 1.2);

      setDprRange([1, Math.max(1, maxDpr)]);
    };

    updateDprRange();
    window.addEventListener("resize", updateDprRange);
    return () => window.removeEventListener("resize", updateDprRange);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
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
      const shiftY = nextProgress * (prefersReducedMotion ? 46 : 72);
      const shiftX = -nextProgress * (prefersReducedMotion ? 20 : 34);
      const scale = 1 - nextProgress * 0.06;
      const tilt = nextProgress * (prefersReducedMotion ? 3 : 6);
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
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateFromRect();
      });
    };

    const onScroll = () => schedule();
    const onResize = () => schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [heroRef, isInView, prefersReducedMotion]);

  useEffect(() => {
    if (!isSceneReady) return;

    // Delay reveal by two frames to avoid occasional first-paint canvas flash.
    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setIsSceneVisible(true);
      });
    });

    return () => {
      if (raf1) window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
    };
  }, [isSceneReady]);

  const isActive = isInView && isPageVisible;

  return (
    <div className="hero-planet-layer" ref={layerRef} aria-hidden="true">
      <div className={`hero-planet-mask${isSceneVisible ? " is-hidden" : ""}`} />
      <div
        className={`hero-planet-canvas${isSceneVisible ? " is-ready" : ""}`}
        style={{ visibility: isSceneVisible ? "visible" : "hidden" }}
      >
        <PlanetSceneErrorBoundary>
          <HeroPlanetScene
            progressRef={progressRef}
            isActive={isActive}
            prefersReducedMotion={prefersReducedMotion}
            dprRange={dprRange}
            onReady={() => setIsSceneReady(true)}
          />
        </PlanetSceneErrorBoundary>
      </div>
    </div>
  );
}
