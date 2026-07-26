import type { Metadata, Viewport } from "next";

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: "Tessarion",
    template: "%s | Tessarion",
  },
  description: "An evidence-linked learning system built around teach-back, retrieval, concept relationships, review, and guided tutoring.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#f4edcf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body><a className="skip-link" href="#main-content">Skip to content</a>{children}</body>
    </html>
  );
}
