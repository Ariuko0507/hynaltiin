import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LayoutClient } from "./_components/layout-client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Хяналтын Систем",
  description: "Байгууллагын даалгавар, биелэлт, хурлын удирдлагын систем",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
