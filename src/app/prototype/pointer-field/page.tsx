import type { Metadata } from "next";
import { PointerFieldLab } from "@/components/prototype/PointerFieldLab";

/**
 * Throwaway prototype route for Feature 3 — validates the Signal / Noise
 * pointer interaction before Feature 4 builds the hero on it.
 *
 * Deleted once Feature 4 lands. Until then it is kept out of search: noindex
 * here, disallowed in `robots.ts`, and absent from `sitemap.ts`.
 */

export const metadata: Metadata = {
  title: "Pointer field — prototype",
  robots: { index: false, follow: false },
};

export default function PointerFieldPrototypePage() {
  return <PointerFieldLab />;
}
