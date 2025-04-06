import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warhamster 4K",
  description: "Crypto built better.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        {/* Navigation Header */}
        <header className="bg-black py-4 shadow-md">
          <nav className="container mx-auto flex justify-center gap-6 text-purple-400 font-semibold">
            <a href="/">Home</a>
            <a href="/profile">Profile</a>
            <a href="/marketplace">Marketplace</a>
            <a href="/dex">DEX</a>
            <a href="/army-builder">Army Builder</a>
            <a href="/battle">Battle</a>
          </nav>
        </header>

        {/* Page Content */}
        <main className="container mx-auto py-8">{children}</main>
      </body>
    </html>
  );
}

