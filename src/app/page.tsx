export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-lab-accent-strong">
        Lamadrid Labs
      </p>
      <h1 className="max-w-2xl">A clean software laboratory.</h1>
      <p className="max-w-md">
        Design tokens and base styles are wired up. Sections land next.
      </p>
      <div className="rounded-lab-md border border-lab-line bg-lab-surface px-6 py-4 shadow-lab-soft">
        <p className="text-sm">Surface sample card</p>
      </div>
    </main>
  );
}
