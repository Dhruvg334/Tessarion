import type { Metadata } from "next";

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: "Tessarion",
    template: "%s | Tessarion",
  },
  description: "An evidence-linked learning system built around teach-back, retrieval, concept relationships, review, and guided tutoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
