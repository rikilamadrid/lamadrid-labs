import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";

export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <Hero />
      <Work />
      <About />
      <Contact />
    </main>
  );
}
