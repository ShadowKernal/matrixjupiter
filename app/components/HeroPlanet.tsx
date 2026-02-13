"use client";

import dynamic from "next/dynamic";
import { Component, ReactNode, useEffect, useRef, useState } from "react";

const HeroPlanetScene = dynamic(() => import("./HeroPlanetScene"), {
  ssr: false,
});

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

const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

type PlanetSectionKeyframe = {
  id: string;
  shiftY: number;
  shiftX: number;
  scale: number;
  tilt: number;
  sceneProgress: number;
  opacity: number;
};

type PlanetFrame = Omit<PlanetSectionKeyframe, "id">;

type ResolvedSectionAnchor = {
  top: number;
  frame: PlanetSectionKeyframe;
};

const desktopSectionTimeline: PlanetSectionKeyframe[] = [
  { id: "hero", shiftY: 0, shiftX: 0, scale: 1, tilt: 0, sceneProgress: 0.02, opacity: 1 },
  { id: "services", shiftY: 170, shiftX: 80, scale: 0.93, tilt: 7, sceneProgress: 0.22, opacity: 0.9 },
  { id: "work", shiftY: 340, shiftX: 150, scale: 0.86, tilt: 11, sceneProgress: 0.4, opacity: 0.76 },
  { id: "about", shiftY: 530, shiftX: 220, scale: 0.79, tilt: 14, sceneProgress: 0.58, opacity: 0.62 },
  { id: "process", shiftY: 710, shiftX: 280, scale: 0.73, tilt: 17, sceneProgress: 0.74, opacity: 0.48 },
  { id: "testimonials", shiftY: 890, shiftX: 330, scale: 0.69, tilt: 19, sceneProgress: 0.87, opacity: 0.36 },
  { id: "contact", shiftY: 1040, shiftX: 370, scale: 0.65, tilt: 21, sceneProgress: 0.95, opacity: 0.24 },
  { id: "footer", shiftY: 1160, shiftX: 410, scale: 0.62, tilt: 23, sceneProgress: 1, opacity: 0.12 },
];

const reducedSectionTimeline: PlanetSectionKeyframe[] = [
  { id: "hero", shiftY: 0, shiftX: 0, scale: 1, tilt: 0, sceneProgress: 0.02, opacity: 1 },
  { id: "services", shiftY: 90, shiftX: 42, scale: 0.96, tilt: 4, sceneProgress: 0.22, opacity: 0.92 },
  { id: "work", shiftY: 186, shiftX: 80, scale: 0.91, tilt: 7, sceneProgress: 0.4, opacity: 0.82 },
  { id: "about", shiftY: 282, shiftX: 116, scale: 0.87, tilt: 10, sceneProgress: 0.58, opacity: 0.7 },
  { id: "process", shiftY: 374, shiftX: 148, scale: 0.84, tilt: 12, sceneProgress: 0.74, opacity: 0.58 },
  { id: "testimonials", shiftY: 462, shiftX: 174, scale: 0.81, tilt: 14, sceneProgress: 0.87, opacity: 0.44 },
  { id: "contact", shiftY: 540, shiftX: 194, scale: 0.78, tilt: 15, sceneProgress: 0.95, opacity: 0.32 },
  { id: "footer", shiftY: 606, shiftX: 210, scale: 0.75, tilt: 16, sceneProgress: 1, opacity: 0.2 },
];

const toFrame = (frame: PlanetSectionKeyframe): PlanetFrame => ({
  shiftY: frame.shiftY,
  shiftX: frame.shiftX,
  scale: frame.scale,
  tilt: frame.tilt,
  sceneProgress: frame.sceneProgress,
  opacity: frame.opacity,
});

const interpolateFrames = (
  from: PlanetSectionKeyframe,
  to: PlanetSectionKeyframe,
  amount: number
): PlanetFrame => ({
  shiftY: mix(from.shiftY, to.shiftY, amount),
  shiftX: mix(from.shiftX, to.shiftX, amount),
  scale: mix(from.scale, to.scale, amount),
  tilt: mix(from.tilt, to.tilt, amount),
  sceneProgress: mix(from.sceneProgress, to.sceneProgress, amount),
  opacity: mix(from.opacity, to.opacity, amount),
});

const resolveSectionAnchors = (
  timeline: PlanetSectionKeyframe[]
): ResolvedSectionAnchor[] =>
  timeline
    .map((frame) => {
      const element = document.getElementById(frame.id);
      if (!element) return null;
      return {
        top: Math.max(element.getBoundingClientRect().top + window.scrollY, 0),
        frame,
      };
    })
    .filter((anchor): anchor is ResolvedSectionAnchor => !!anchor)
    .sort((a, b) => a.top - b.top);

const frameFromSectionAnchors = (
  scrollY: number,
  anchors: ResolvedSectionAnchor[],
  timeline: PlanetSectionKeyframe[]
): PlanetFrame => {
  if (!anchors.length) {
    const fallback = timeline[0];
    if (!fallback) {
      return {
        shiftY: 0,
        shiftX: 0,
        scale: 1,
        tilt: 0,
        sceneProgress: 0,
        opacity: 1,
      };
    }
    return toFrame(fallback);
  }

  if (anchors.length === 1) {
    return toFrame(anchors[0].frame);
  }

  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  if (!first || !last) {
    return {
      shiftY: 0,
      shiftX: 0,
      scale: 1,
      tilt: 0,
      sceneProgress: 0,
      opacity: 1,
    };
  }

  if (scrollY <= first.top) {
    return toFrame(first.frame);
  }

  if (scrollY >= last.top) {
    return toFrame(last.frame);
  }

  for (let index = 0; index < anchors.length - 1; index += 1) {
    const start = anchors[index];
    const end = anchors[index + 1];
    if (!start || !end || scrollY > end.top) continue;

    const amount = clamp((scrollY - start.top) / Math.max(end.top - start.top, 1), 0, 1);
    return interpolateFrames(start.frame, end.frame, amount);
  }

  return toFrame(last.frame);
};

export default function HeroPlanet() {
  const layerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
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
    const layer = layerRef.current;
    if (!layer) return;

    const sectionTimeline = prefersReducedMotion ? reducedSectionTimeline : desktopSectionTimeline;

    const applyFrame = (frameData: PlanetFrame) => {
      progressRef.current = frameData.sceneProgress;
      layer.style.setProperty("--planet-progress", frameData.sceneProgress.toFixed(4));
      layer.style.setProperty("--planet-fade", "1");
      layer.style.setProperty("--planet-shift-y", `${frameData.shiftY.toFixed(2)}px`);
      layer.style.setProperty("--planet-shift-x", `${frameData.shiftX.toFixed(2)}px`);
      layer.style.setProperty("--planet-scale", frameData.scale.toFixed(4));
      layer.style.setProperty("--planet-tilt", frameData.tilt.toFixed(2));
      layer.style.setProperty("--planet-layer-z", "1");
      layer.style.setProperty("--planet-layer-opacity", "0.78");
    };

    const updateFromScroll = () => {
      const anchors = resolveSectionAnchors(sectionTimeline);
      const frame = frameFromSectionAnchors(
        window.scrollY,
        anchors,
        sectionTimeline
      );
      applyFrame(frame);
    };

    updateFromScroll();

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateFromScroll();
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
  }, [prefersReducedMotion]);

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

  const isActive = isPageVisible;

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
