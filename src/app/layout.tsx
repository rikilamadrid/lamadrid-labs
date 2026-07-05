import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { AmbientParticles } from "@/components/layout/AmbientParticles";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { LOCALE_INIT_SCRIPT } from "@/lib/locale";
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

const TITLE =
  "Lamadrid Labs — Thoughtful software, AI workflows, and digital products";
const DESCRIPTION =
  "Lamadrid Labs is an independent software studio by Ricardo Lamadrid, building elegant websites, product prototypes, AI workflows, and digital experiments.";

export const metadata: Metadata = {
  metadataBase: new URL("https://lamadridlabs.com"),
  title: TITLE,
  description: DESCRIPTION,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: "https://lamadridlabs.com",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#020812",
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
        <script
          // Sets <html lang> before paint so the active locale is correct on
          // first render — no flash, no hydration mismatch.
          dangerouslySetInnerHTML={{ __html: LOCALE_INIT_SCRIPT }}
        />
      </head>
      <body id="top" className="min-h-full flex flex-col pt-24">
        <LocaleProvider>
          <AmbientParticles />
          <ScrollProgress />
          <Nav />
          <div className="relative z-10 flex flex-1 flex-col">
            {children}
            <Footer />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
