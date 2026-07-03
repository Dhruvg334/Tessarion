import type { Metadata } from "next";
import { Caveat } from "next/font/google";

import './globals.css';

const caveat = Caveat({ subsets: ["latin"], display: "swap", variable: "--font-caveat" });

export const metadata: Metadata = {
  title: "Tessarion — Learn by Teaching",
  description: "An AI-powered deep learning workspace where students learn by teaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={caveat.variable}>
      <body>{children}</body>
    </html>
  );
}
