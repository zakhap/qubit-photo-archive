import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "QUBIT PERFORMANCE ARCHIVE",
  description: "Performance art archive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <header className="sticky top-0 bg-white z-50 py-4 px-6 border-b border-gray-200">
          <h1 className="text-sm font-normal tracking-wide text-black">QUBIT PERFORMANCE ARCHIVE</h1>
        </header>
        <main className="flex-1 bg-white text-black">
          {children}
        </main>
        <footer className="fixed bottom-0 left-0 right-0 bg-white py-4 px-6 border-t border-gray-200 z-10">
          <p className="text-sm text-black">Contact</p>
        </footer>
      </body>
    </html>
  );
}
