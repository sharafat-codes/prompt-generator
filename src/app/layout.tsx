import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptPilot — Prompts that compound",
  description:
    "A calm, premium workspace where your best prompts become reusable recipes — so the work you do once keeps paying you back.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
