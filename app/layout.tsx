import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Audio Equalizer for Chrome - 10 Band EQ Extension | Free",
  description:
    "Free 10-band audio equalizer Chrome extension. Boost bass, adjust treble, use presets, and control volume up to 200%. Works on any website.",
  keywords: [
    "equalizer for chrome",
    "audio equalizer chrome",
    "chrome equalizer extension",
    "bass boost chrome",
    "browser equalizer",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
