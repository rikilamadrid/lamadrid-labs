import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AmbientParticles } from "@/components/layout/AmbientParticles";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lamadrid Labs",
  description: "Lamadrid Labs — an independent software studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          // Sets the theme class before paint to avoid a flash of the wrong theme.
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body id="top" className="min-h-full flex flex-col pt-24">
        <AmbientParticles />
        <ScrollProgress />
        <Nav />
        <div className="relative z-10 flex flex-1 flex-col">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
