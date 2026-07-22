"use client";

import dynamic from "next/dynamic";

// `ssr: false` dynamic imports aren't allowed directly inside a Server
// Component (page.tsx) — this thin client wrapper hosts both specimen
// canvases so page.tsx can stay a server component. Each canvas self-gates
// to its own viewport (desktop/mobile) and to `prefers-reduced-motion`, see
// SpecimenCanvas / MobileSpecimenLayer.
const SpecimenCanvas = dynamic(
  () =>
    import("@/components/sections/process/SpecimenCanvas").then(
      (mod) => mod.SpecimenCanvas,
    ),
  { ssr: false },
);
const MobileSpecimenLayer = dynamic(
  () =>
    import("@/components/sections/process/MobileSpecimenLayer").then(
      (mod) => mod.MobileSpecimenLayer,
    ),
  { ssr: false },
);

export function SpecimenLayers() {
  return (
    <>
      <SpecimenCanvas />
      <MobileSpecimenLayer />
    </>
  );
}
