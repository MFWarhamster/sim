export default function Home() {
  return (
    <div className="container mx-auto py-20 text-center text-white">
      <h1 className="text-5xl font-bold mb-4">🐹 Warhamster 4K</h1>
      <p className="text-lg text-gray-300 mb-6">
        The future of decentralized hamster warfare is here.
      </p>

      <p className="text-gray-400 mb-8">
        Explore the dApp simulation below:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-xl mx-auto">
        <a href="/profile" className="bg-gray-800 p-4 rounded hover:bg-purple-600">👤 Profile</a>
        <a href="/marketplace" className="bg-gray-800 p-4 rounded hover:bg-purple-600">🏪 Marketplace</a>
        <a href="/dex" className="bg-gray-800 p-4 rounded hover:bg-purple-600">💱 DEX</a>
        <a href="/army-builder" className="bg-gray-800 p-4 rounded hover:bg-purple-600">🛡️ Army Builder</a>
        <a href="/battle" className="bg-gray-800 p-4 rounded hover:bg-purple-600">⚔️ Battle Modes</a>
        <a href="/battle/gameplay" className="bg-gray-800 p-4 rounded hover:bg-purple-600">🎮 Gameplay Demo</a>
      </div>
    </div>
  );
}

