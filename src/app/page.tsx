import { Hero } from "@/components/sections/Hero";
import { WorkShowcase } from "@/components/sections/WorkShowcase";

export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <Hero />
      <WorkShowcase />
    </main>
  );
}
