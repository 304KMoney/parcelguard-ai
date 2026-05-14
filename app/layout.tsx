import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ParcelGuard AI — Pre-Bid Tax Sale Risk Intelligence",
  description:
    "Upload your county tax sale list and get ranked risk scores, source confidence ratings, conflict flags, max-bid guardrails, and a professional investor brief — all before auction day.",
  keywords: [
    "tax lien investing",
    "tax deed investing",
    "tax sale due diligence",
    "pre-bid risk analysis",
    "parcel risk scoring",
  ],
  openGraph: {
    title: "ParcelGuard AI",
    description: "Tax sale research before you risk capital.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen antialiased" style={{ backgroundColor: "#0f172a", color: "#f1f5f9" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
