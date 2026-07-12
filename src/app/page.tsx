import { About } from "@/components/sections/About";
import { Finale } from "@/components/sections/Finale";
import { Hero } from "@/components/sections/Hero";
import { Narrative } from "@/components/sections/Narrative";
import { Services } from "@/components/sections/Services";

export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <Hero />
      <Narrative />
      {/* Finale carries the project showcase + contact CTA; it replaces the
          standalone WorkShowcase and Contact sections (removed here). */}
      <Finale />
      <Services />
      <About />
    </main>
  );
}
