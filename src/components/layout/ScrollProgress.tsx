"use client";

import { useEffect, useRef } from "react";
import { navLinks } from "@/data/navigation";

// One node for the top of the page, then one per main section.
const NODE_COUNT = navLinks.length + 1;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const SMOOTHING = 0.16;

export function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    let animationFrame = 0;
    let targetProgress = 0;
    let visibleProgress = 0;
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    const setPipeProgress = (progress: number) => {
      fillRef.current?.style.setProperty("--scroll-progress", `${progress}`);
      nodeRefs.current.forEach((node, i) => {
        const position = i / (NODE_COUNT - 1);
        node?.classList.toggle("is-active", progress >= position - 0.001);
      });
    };

    const readProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
    };

    const animate = () => {
      readProgress();

      if (mediaQuery.matches) {
        visibleProgress = targetProgress;
      } else {
        visibleProgress += (targetProgress - visibleProgress) * SMOOTHING;
        if (Math.abs(targetProgress - visibleProgress) < 0.001) {
          visibleProgress = targetProgress;
        }
      }

      setPipeProgress(visibleProgress);
      animationFrame = window.requestAnimationFrame(animate);
    };

    readProgress();
    visibleProgress = targetProgress;
    setPipeProgress(visibleProgress);
    animationFrame = window.requestAnimationFrame(animate);

    window.addEventListener("scroll", readProgress, { passive: true });
    window.addEventListener("resize", readProgress);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", readProgress);
      window.removeEventListener("resize", readProgress);
    };
  }, []);

  return (
    <div className="lab-pipe" aria-hidden="true">
      <div ref={fillRef} className="lab-pipe-fill" />
      {Array.from({ length: NODE_COUNT }, (_, i) => {
        const position = i / (NODE_COUNT - 1);
        return (
          <span
            key={i}
            ref={(node) => {
              nodeRefs.current[i] = node;
            }}
            className="lab-pipe-node"
            style={{ top: `${position * 100}%` }}
          />
        );
      })}
    </div>
  );
}
