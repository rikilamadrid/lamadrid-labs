// PROTOTYPE — throwaway. Wraps the real Process section (feature 38) with
// filler sections above/below so the pinned scroll hand-off (entry and
// exit) can be verified manually, same as the real homepage would.
import { Process } from "@/components/sections/Process";

export default function ProcessScrollDevPage() {
  return (
    <main className="bg-lab-bg text-lab-ink">
      <section className="flex h-screen items-center justify-center px-6">
        <p className="text-sm text-white/40">Filler section before Process — scroll down</p>
      </section>

      <Process />

      <section className="flex h-screen items-center justify-center px-6">
        <p className="text-sm text-white/40">Filler section after Process — scroll resumed</p>
      </section>
    </main>
  );
}
