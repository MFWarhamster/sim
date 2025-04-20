"use client";

import { useEffect, useState } from "react";

export default function NFTMintPage() {
  const [wallet, setWallet] = useState({ sol: 5000, war4k: 5000 });
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [lastMinted, setLastMinted] = useState<any | null>(null);
  const [availableNFTs, setAvailableNFTs] = useState<any[]>([]);
  const mintPrice = 100;

  useEffect(() => {
    const enrichNFT = (nft: any) => ({
      ...nft,
      image: `/nfts/0-${nft.id.toString().padStart(3, "0")}.jpg`,
    });
  
    const storedNFTs = localStorage.getItem("warhamster_minted_nfts");
    const storedWallet = localStorage.getItem("warhamster_wallet");
  
    if (storedNFTs) {
      const parsed = JSON.parse(storedNFTs);
      const enriched = parsed.map(enrichNFT);
      setOwnedNFTs(enriched);
    }
  
    if (storedWallet) {
      setWallet(JSON.parse(storedWallet));
    }
  
    fetch("/data/warhamster_nfts_with_power_abilities_final.json")
      .then((res) => res.json())
      .then((data) => {
        const enriched = data.map(enrichNFT);
        setAvailableNFTs(enriched);
      })
      .catch((err) => console.error("Failed to load NFT data", err));
  }, []);  

  const handleMint = (token: "sol" | "war4k") => {
    if (wallet[token] < mintPrice) {
      alert(`Not enough ${token.toUpperCase()} to mint.`);
      return;
    }

    if (availableNFTs.length === 0) {
      alert("No NFTs left to mint!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableNFTs.length);
    const chosen = availableNFTs[randomIndex];

    const updatedWallet = { ...wallet, [token]: wallet[token] - mintPrice };
    const updatedOwned = [...ownedNFTs, chosen];
    const updatedAvailable = [...availableNFTs];
    updatedAvailable.splice(randomIndex, 1);

    setWallet(updatedWallet);
    setOwnedNFTs(updatedOwned);
    setAvailableNFTs(updatedAvailable);
    setLastMinted(chosen);
    localStorage.setItem("warhamster_minted_nfts", JSON.stringify(updatedOwned));
    localStorage.setItem("warhamster_wallet", JSON.stringify(updatedWallet));
  };

  return (
<div className="grid place-items-center text-center mx-auto max-w-[700] min-h-[500] rounded-xl p-1 inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 text-white font-[Open_Sans] shadow-md shadow-gray-950 bg-gray-950/50">
      <h1 className="flex justify-center text-5xl font-black mb-2 mt-2 text-shadow-lg/30">NFT MARKET</h1>
      <div className="grid place-items-center text-center min-w-[500] bg-gray-950 p-1 inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 p-6 rounded-t-xl shadow-sm shadow-black">
        <h2 className="text-2xl font-black mb-2 text-shadow-lg/30">Wallet Balance</h2>
        <p>🔵 SOL: ${wallet.sol.toLocaleString()}</p>
        <p>🟣 WAR4K: ${wallet.war4k.toLocaleString()}</p>

        <div className="flex justify-between mt-2">
          <button
            className="bg-gray-700 p-2 inset-ring inset-ring-gray-600 shadow-sm shadow-black rounded-l-xl hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300"
            onClick={() => handleMint("sol")}
          >
            Mint with SOL ($100)
          </button>
          <button
            className="bg-gray-700 p-2 inset-ring inset-ring-gray-600 shadow-sm shadow-black rounded-r-xl hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300"
            onClick={() => handleMint("war4k")}
          >
            Mint with WAR4K ($100)
          </button>
        </div>
      </div>

      {/* Minted Card Frame */}
      <div className="grid place-items-center min-w-[500] min-h-[512] mt-2 text-center bg-gray-950 p-1 inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 rounded-b-xl shadow-sm shadow-black">
      <div className="flex flex-col flex justify-center min-w-[490] min-h-[500] rounded-xl p-1 inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 text-white font-[Open_Sans] shadow-md shadow-gray-950 bg-gray-950/50">
      <h2 className="text-xl font-bold mb-2 text-yellow-300">Latest Minted NFT</h2>
        {lastMinted ? (
          <div className="space-y-2">
            <img
              src={lastMinted.image}
              alt={lastMinted.name}
              className="rounded-lg mx-auto border-3 border-gray-900 shadow w-full max-w-[200] h-auto max-h-[300px] object-contain"
            />
            <p className="text-2xl font-bold text-green-400">✅ {lastMinted.name}</p>
            <p>Tier: {lastMinted.tier} | Power: {lastMinted.powerRating}</p>
            <p>Legion: {lastMinted.legion}</p>
            <p>World: {lastMinted.world}</p>
          </div>
        ) : (
          <p className="text-gray-500">No mint yet. Click a button to mint!</p>
        )}
      </div>
      </div>

      {/* Owned */}
      {ownedNFTs.length > 0 && (
        <div className="mt-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-white">YOUR WARHAMSTERS</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {ownedNFTs.map((nft, i) => (
              <li key={i} className="bg-gray-900 p-2 rounded-xl border border-gray-800 text-yellow-300">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="rounded mb-2 h-32 w-full object-contain"
                />
                <p className="font-semibold">{nft.name}</p>
                <p className="text-sm">Power: {nft.powerRating}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
