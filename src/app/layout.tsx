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
      <body className="bg-gray-950 text-white font-black font-[Open_Sans]">
        <header className="bg-black py-2 flex flex-col gap-2 flex justify-center inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 shadow-lg shadow-black bg-linear-to-t from-gray-900 to-gray-800">
          <nav className="container mx-auto flex justify-center rounded-2xl p-1 inset-ring inset-ring-black dark:bg-gray-900 dark:inset-ring-white/10 text-white font-[Open_Sans] max-w-[725]">
          <Link
href="/"
className="bg-gray-800 p-2 px-6 inset-ring inset-ring-gray-700 shadow-sm shadow-black rounded-l-xl hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300 active:text-blue-100"
>
  HOME
</Link>
<Link
href="/player-profile"
className="bg-gray-800 p-2 px-6 inset-ring inset-ring-gray-700 shadow-sm shadow-black hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300 hover:inset-shadow-sm hover:inset-shadow-indigo-800 active:text-blue-100"
>
PROFILE
</Link>
<Link
href="/dex"
className="bg-gray-800 p-2 px-6 inset-ring inset-ring-gray-700 shadow-sm shadow-black hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300 hover:inset-shadow-sm hover:inset-shadow-indigo-800 active:text-blue-100"
>
DEX
</Link>
<Link
href="/marketplace"
className="bg-gray-800 p-2 px-6 inset-ring inset-ring-gray-700 shadow-sm shadow-black hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300 hover:inset-shadow-sm hover:inset-shadow-indigo-800 active:text-blue-100"
>
NFT MARKET
</Link>
<Link
href="/army-builder"
className="bg-gray-800 p-2 px-6 inset-ring inset-ring-gray-700 shadow-sm shadow-black hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300 hover:inset-shadow-sm hover:inset-shadow-indigo-800 active:text-blue-100"
>
ARMY BUILDER
</Link>
<Link
href="/battle"
className="bg-gray-800 p-2 px-6 inset-ring inset-ring-gray-700 shadow-sm shadow-black rounded-r-xl hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300 hover:inset-shadow-sm hover:inset-shadow-indigo-800 active:text-blue-100"
>
BATTLE
</Link>
          </nav>
        </header>
        <main className="container mx-auto py-8">{children}</main>
      </body>
    </html>
  );
}