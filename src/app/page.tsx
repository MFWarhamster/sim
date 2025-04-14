import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto py-20 text-center text-white">
      <h1 className="text-5xl font-bold mb-4">🐹 Warhamster 4K</h1>
      <p className="text-lg text-gray-300 mb-6">
        This is a demonstration of the crypto and NFT decentralized application(dApp) that we intend to build. Everything you see here has been built in house to provide a clear picture of our end user product.
      </p>

      <p className="text-gray-400 mb-8">
        Explore the dApp simulation below:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mx-auto">
        <Link href="/profile" className="bg-gray-800 p-4 rounded hover:bg-purple-600">👤 Profile</Link>
        <Link href="/dex" className="bg-gray-800 p-4 rounded hover:bg-purple-600">💱 DEX</Link>
        <Link href="/marketplace" className="bg-gray-800 p-4 rounded hover:bg-purple-600">🏪 Marketplace</Link>
        <Link href="/army-builder" className="bg-gray-800 p-4 rounded hover:bg-purple-600">🛡️ Army Builder</Link>
        <Link href="/battle" className="bg-gray-800 p-4 rounded hover:bg-purple-600">⚔️ PVP</Link>
      </div>
    </div>
  );
}