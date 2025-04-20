"use client";

import { useEffect, useState } from "react";

export default function DexPage() {
  const [wallet, setWallet] = useState({ sol: 20000, war4k: 20000 });
  const [selectedToken, setSelectedToken] = useState("sol");
  const [amount, setAmount] = useState(0);

  const handleSwap = () => {
    const rate = 1; // 1:1 mock rate for now
    if (selectedToken === "sol" && wallet.sol >= amount) {
      setWallet((prev) => ({
        sol: prev.sol - amount,
        war4k: prev.war4k + amount * rate,
      }));
    } else if (selectedToken === "war4k" && wallet.war4k >= amount) {
      setWallet((prev) => ({
        sol: prev.sol + amount * rate,
        war4k: prev.war4k - amount,
      }));
    }
    setAmount(0);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4 text-center">💱 Warhamster DEX (Mock)</h1>

      <div className="bg-gray-900 p-6 rounded-xl shadow-lg max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-2">Wallet Balances</h2>
        <p>🔵 SOL: ${wallet.sol.toLocaleString()}</p>
        <p>🟣 WAR4K: ${wallet.war4k.toLocaleString()}</p>

        <div className="mt-6">
          <h3 className="font-bold mb-2">Swap</h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="bg-gray-800 px-3 py-1 rounded text-white"
            >
              <option value="sol">SOL → WAR4K</option>
              <option value="war4k">WAR4K → SOL</option>
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="px-2 py-1 w-32 rounded bg-gray-800 text-white border border-gray-600"
            />
            <button
              onClick={handleSwap}
              className="bg-green-600 px-4 py-1 rounded hover:bg-green-500"
            >
              Swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}