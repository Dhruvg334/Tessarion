import type { Metadata } from "next";

import './globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
