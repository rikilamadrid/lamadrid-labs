import { contactLink } from "@/data/social";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-lab-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-8 text-sm text-lab-muted sm:flex-row sm:justify-between">
        <p>&copy; {year} Lamadrid Labs. All rights reserved.</p>
        <a
          href={contactLink.href}
          className="outline-none transition-colors hover:text-lab-ink focus-visible:ring-2 focus-visible:ring-lab-accent-strong"
        >
          {contactLink.label}
        </a>
      </div>
    </footer>
  );
}
