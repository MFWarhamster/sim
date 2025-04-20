"use client";

import { useEffect, useState } from "react";

export default function PlayerProfilePage() {
  const [selectedTab, setSelectedTab] = useState("nfts");
  const [armyData, setArmyData] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("warhamster_army_data");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setArmyData(parsed);
      } catch (err) {
        console.error("Invalid army data in localStorage", err);
      }
    }
  }, []);

  const tabs = ["nfts", "history", "rewards"];

  return (
    <div className="p-4 text-white max-w-[700] mx-auto rounded-xl inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 text-white font-[Open_Sans] shadow-md shadow-gray-950 bg-gray-950/50">
      {/* Top Profile Header */}
      <div className="rounded-xl p-2 mb-3 inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 shadow-sm shadow-gray-950 bg-gray-950/50">
        <h1 className="bg-gray-950/50 p-2 inset-ring inset-ring-gray-800 shadow-sm shadow-black rounded-t-xl">@Player</h1>
        <p className="bg-gray-950/50 p-2 inset-ring inset-ring-gray-800 shadow-sm shadow-black">Wallet: 0x123...abc</p>
        <p className="bg-gray-950/50 p-2 inset-ring inset-ring-gray-800 shadow-sm shadow-black rounded-b-xl">
          Total Army Power: {
            armyData?.stacksByArmy?.[armyData.armies?.[0]]?.flatMap((stack: any) => stack.units || [])
              .reduce((acc: number, unit: any) => acc + (unit.power || 0), 0) || 0
          }
        </p>
      </div>

      {/* Tab Content */}
      <div className="rounded-xl p-2 min-h-[700] inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 shadow-sm shadow-gray-950 bg-gray-950/50">
      <div className="bg-gray-950 rounded-t-xl flex space-x-2 inset-ring inset-ring-gray-950">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`rounded-t-xl py-3 px-3 hover: cursor-pointer ${
              selectedTab === tab ? "bg-gray-800" : "bg-gray-900 hover:bg-blue-400 hover: cursor-pointer"
            }`}
          >
            {tab === "nfts" && "NFTs Owned"}
            {tab === "history" && "Battle History"}
            {tab === "rewards" && "Rewards Summary"}
          </button>
        ))}
      </div>
        {selectedTab === "nfts" && (
          <div className="space-y-2 px-6 min-h-[630] rounded-b-xl bg-gray-800">
            {armyData?.stacksByArmy?.[armyData.armies?.[0]]?.map((stack: any, i: number) => (
              <div key={i}>
                <h3 className="text-lg font-bold mb-1">{stack.name}</h3>
                {stack.units.length === 0 ? (
                  <p className="text-gray-400 italic text-sm">No units in this stack.</p>
                ) : (
                  <ul className="pl-4 list-disc">
                    {stack.units.map((nft: any, j: number) => (
                      <li key={j} className="text-yellow-300">
                        {nft.name} (Power: {nft.power})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedTab === "history" && (
          <div className="space-y-2 p-4 px-6 min-h-[630] rounded-b-xl bg-gray-800">
            <p className="text-white">⚔️ Wins: TBD</p>
            <p className="text-white">💀 Losses: TBD</p>
            <p className="text-white">🟰 Draws: TBD</p>
            <p className="text-yellow-300">🏆 Worlds Conquered: TBD</p>
          </div>
        )}

        {selectedTab === "rewards" && (
          <div className="space-y-2 p-4 px-6 min-h-[630] rounded-b-xl bg-gray-800">
            <p className="text-green-300">💰 WAR4K Earned: 0</p>
            <p className="text-green-300">📈 Projected Daily: 0</p>
            <p className="text-green-300">🔒 Staking Bonus: 0%</p>
          </div>
        )}
      </div>
    </div>
  );
}
