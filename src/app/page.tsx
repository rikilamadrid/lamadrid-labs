import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Work } from "@/components/sections/Work";
import { SpecimenLayers } from "@/components/layout/SpecimenLayers";

export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <SpecimenLayers />
      <Hero />
      <Process />
      <Work />
      <About />
      <Contact />
    </main>
  );
}
