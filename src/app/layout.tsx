import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AppToaster } from "@/components/providers/app-toaster";
import { APP_NAME } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Learning management, clarified`,
    template: `%s · ${APP_NAME}`,
  },
  description: `${APP_NAME} is a learning platform for teachers and students — classes, assignments, and feedback.`,
  icons: {
    icon: [
      { url: "/favicon.ico?v=9", sizes: "any" },
      { url: "/logo.png?v=9", type: "image/png", sizes: "any" },
      { url: "/favicon.png?v=9", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png?v=9", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=9", sizes: "180x180" }],
    shortcut: "/favicon.ico?v=9",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full`}
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <AppToaster />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
