import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlatSync — Find the flat you can all agree on",
  description:
    "Capture each roommate's constraints and preferences before the search, then compare listings with a transparent trade-off breakdown.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
