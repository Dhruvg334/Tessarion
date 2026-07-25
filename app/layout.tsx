import type { Metadata } from "next";
import { Caveat } from "next/font/google";

import './globals.css';

const caveat = Caveat({ subsets: ["latin"], display: "swap", variable: "--font-caveat" });

export const metadata: Metadata = {
  title: "Tessarion — Learn by Teaching",
  description: "An evidence-linked learning workspace where students build understanding by teaching concepts back.",
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
