import { About } from "@/components/sections/About";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { WorkShowcase } from "@/components/sections/WorkShowcase";

export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <Hero />
      <WorkShowcase />
      <Services />
      <About />
    </main>
  );
}
