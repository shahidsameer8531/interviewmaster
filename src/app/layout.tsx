import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";
import { Bricolage_Grotesque, Manrope, JetBrains_Mono } from "next/font/google";
import { generateMetadata } from "@/lib/generateMetadata";
import { ConvexClientProvider } from "@/providers/ConvexAuthProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/features/auth/context/AuthContext";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  adjustFontFallback: false,
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = generateMetadata();

/**
 * Root layout: document, fonts, providers and global overlays only.
 * Marketing chrome lives in (marketing)/layout.tsx; the signed-in app
 * shell lives in (app)/layout.tsx.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang="en"
        className={cn("dark", display.variable, body.variable, mono.variable)}
        suppressHydrationWarning
      >
        <head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="theme-color" content="#0a1628" />
        </head>
        <body className="min-h-screen bg-background font-sans antialiased">
          <ConvexClientProvider>
            <AuthProvider>
              <NextTopLoader showSpinner={false} color="#fcba28" height={2} />
              <div id="portal-root" />
              {children}
              <Toaster />
              <Analytics />
            </AuthProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
