"use client";

import { useMemo } from "react";
import { CanvasTexture, RepeatWrapping } from "three";
import { PROCESS_ENV_KEY } from "@/lib/narrativeSignals";
import type { Theme } from "@/lib/theme";

// Feature 53 — a soft, cheap depth cue for the background: the reference
// renders sit in a deep out-of-focus lab (shelves of glassware behind the
// bench), and a bare scene reads flat/staged even with premium rigs (48-52)
// in front of it. Rather than modeling real background geometry (expensive,
// and would compete with the orb/rig focus per the brief), this paints one
// small in-memory canvas texture of blurred bottle/flask silhouettes (no
// image fetch — static-export safe, matching ProcessEnvironment's fetch-free
// convention) and shows it on a single unlit plane, tiled and set back in
// depth. One draw call at mount, zero per-frame cost.
function useGlasswareSilhouetteTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = "blur(7px)";

    const shapeCount = 7;
    for (let i = 0; i < shapeCount; i++) {
      const cx = ((i + 0.5) / shapeCount) * canvas.width + Math.sin(i * 3.1) * 12;
      const height = 60 + Math.sin(i * 1.7) * 24;
      const width = 16 + Math.cos(i * 2.3) * 6;
      const top = canvas.height - height;
      const radius = width / 2;

      const gradient = ctx.createLinearGradient(cx, top, cx, canvas.height);
      gradient.addColorStop(0, "rgba(159, 228, 255, 0.32)");
      gradient.addColorStop(1, "rgba(159, 228, 255, 0)");
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(cx - radius, canvas.height);
      ctx.lineTo(cx - radius, top + radius);
      ctx.quadraticCurveTo(cx - radius, top, cx, top);
      ctx.quadraticCurveTo(cx + radius, top, cx + radius, top + radius);
      ctx.lineTo(cx + radius, canvas.height);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }, []);
}

interface ProcessBackdropProps {
  theme: Theme;
  /** World-space depth (negative = further behind the rig track). */
  z?: number;
  /** Visible width to cover the camera frustum at that depth. */
  width?: number;
  /** How many times the silhouette texture tiles across that width. */
  repeat?: number;
}

// A static, unlit backdrop plane behind the rig track. Deliberately never
// tracks scroll progress — the camera itself never moves (only the rig track
// slides beneath it, per 38), so a fixed plane already reads as a distant,
// consistent wall of shelving no matter which stage is in view.
export function ProcessBackdrop({
  theme,
  z = -9,
  width = 26,
  repeat = 3,
}: ProcessBackdropProps) {
  const texture = useGlasswareSilhouetteTexture();
  if (!texture) return null;

  texture.repeat.set(repeat, 1);
  const opacity = theme === "light" ? 0.14 : 0.4;
  // Keep each tile at the canvas's own aspect ratio so silhouettes don't warp.
  const height = (width / repeat) * (160 / 512);

  return (
    <mesh position={[0, 0.4, z]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        color={PROCESS_ENV_KEY}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
