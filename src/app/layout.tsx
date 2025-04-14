import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warhamster App",
  description: "Warhamster Army Builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white font-[Inter]">
        <header className="bg-black py-4 shadow-md">
          <nav className="container mx-auto flex justify-center gap-6 text-purple-400 font-semibold">
            <Link href="/">Home</Link>
            <Link href="/profile">Profile</Link>
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/dex">DEX</Link>
            <Link href="/army-builder">Army Builder</Link>
            <Link href="/battle">Battle</Link>
          </nav>
        </header>
        <main className="container mx-auto py-8">{children}</main>
      </body>
    </html>
  );
}