"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/data/navigation";

// One node for the top of the page, then one per main section.
const NODE_COUNT = navLinks.length + 1;

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="lab-pipe" aria-hidden="true">
      <div className="lab-pipe-fill" style={{ height: `${progress * 100}%` }} />
      {Array.from({ length: NODE_COUNT }, (_, i) => {
        const position = i / (NODE_COUNT - 1);
        return (
          <span
            key={i}
            className={`lab-pipe-node${progress >= position - 0.001 ? " is-active" : ""}`}
            style={{ top: `${position * 100}%` }}
          />
        );
      })}
    </div>
  );
}
