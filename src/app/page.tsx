import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Narrative } from "@/components/sections/Narrative";
import { Services } from "@/components/sections/Services";
import { WorkShowcase } from "@/components/sections/WorkShowcase";

export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <Hero />
      <Narrative />
      <WorkShowcase />
      <Services />
      <About />
      <Contact />
    </main>
  );
}
