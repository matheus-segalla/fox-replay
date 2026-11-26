import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://www.foxreplay.com.br";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "FOX REPLAY — Replay Esportivo Instantâneo para Arenas",
    template: "%s | FOX REPLAY",
  },
  description:
    "Reveja e baixe seus lances esportivos instantaneamente. Tecnologia autônoma de replay para Beach Tennis, Futevôlei, Padel e Tênis.",
  keywords: [
    "Fox Replay",
    "replay esportivo",
    "gravação de lances",
    "beach tennis",
    "futevôlei",
    "padel",
    "tênis",
    "arena esportiva",
    "replay quadra",
  ],
  authors: [{ name: "FOX REPLAY" }],
  creator: "FOX REPLAY",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE_URL,
    siteName: "FOX REPLAY",
    title: "FOX REPLAY — Seus lances além dos limites da quadra",
    description:
      "Aperte o botão na quadra, localize sua arena e baixe seus melhores lances em alta definição.",
    images: [
      {
        url: "/logo-fox.jpeg",
        width: 1254,
        height: 1254,
        alt: "FOX REPLAY",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FOX REPLAY — Replay Esportivo Instantâneo",
    description:
      "Aperte o botão na quadra, localize sua arena e baixe seus melhores lances pelo celular.",
    images: ["/logo-fox.jpeg"],
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0d0d0d",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="min-h-full scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-[#0d0d0d] text-white`}>
        {children}
      </body>
    </html>
  );
}