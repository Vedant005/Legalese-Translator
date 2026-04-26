import type { Metadata } from "next";
import {
  Playfair_Display,
  Source_Serif_4,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Legalese Translator | Precise Contract Analysis",
  description: "Translate complex terms of service into plain English.",

  openGraph: {
    title: "Legalese Translator | Precise Contract Analysis",
    description: "Translate complex terms of service into plain English.",
    url: "https://legalese.vercel.app",
    siteName: "Legalese Translator | Precise Contract Analysis",
    images: [
      {
        url: "/legalese.png",
        width: 1200,
        height: 630,
        alt: "Legalese Translator | Precise Contract Analysis Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legalese Translator | Precise Contract Analysis",
    description: "Generate content from videos",
    images: ["/legalese.png"],
    creator: "@VedantKane56217",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  authors: [{ name: "Vedant" }],
  creator: "Vedant",
  publisher: "Vedant",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} font-body bg-white text-black min-h-screen selection:bg-black selection:text-white`}
      >
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        ></div>
        {children}
      </body>
    </html>
  );
}
