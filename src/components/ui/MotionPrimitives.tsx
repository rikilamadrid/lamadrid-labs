"use client";

import { motion } from "motion/react";
import { useSyncExternalStore, type ReactNode } from "react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return true;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
};

export function MotionReveal({
  children,
  delay = 0,
  distance = 16,
  ...props
}: MotionRevealProps) {
  const shouldReduceMotion = usePrefersReducedMotion();

  if (shouldReduceMotion) {
    return <div {...props}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type MotionCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function MotionCard({ children, delay = 0, ...props }: MotionCardProps) {
  const shouldReduceMotion = usePrefersReducedMotion();

  if (shouldReduceMotion) {
    return <div {...props}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type MotionLinkCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  href: string;
  rel?: string;
  target?: string;
};

export function MotionLinkCard({
  children,
  delay = 0,
  ...props
}: MotionLinkCardProps) {
  const shouldReduceMotion = usePrefersReducedMotion();

  if (shouldReduceMotion) {
    return <a {...props}>{children}</a>;
  }

  return (
    <motion.a
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay }}
      {...props}
    >
      {children}
    </motion.a>
  );
}
