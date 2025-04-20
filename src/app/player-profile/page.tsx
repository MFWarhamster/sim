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
    <div className="p-6 text-white">
      {/* Top Profile Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
        <h1 className="text-3xl font-bold">@Player</h1>
        <p className="text-sm text-gray-400">Wallet: 0x123...abc</p>
        <p className="mt-2 text-green-400 font-semibold">
          Total Army Power: {
            armyData?.stacksByArmy?.[armyData.armies?.[0]]?.flatMap((stack: any) => stack.units || [])
              .reduce((acc: number, unit: any) => acc + (unit.power || 0), 0) || 0
          }
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 rounded-t-xl">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`rounded-t-xl py-3 px-8 hover: cursor-pointer ${
              selectedTab === tab ? "bg-gray-800" : "bg-gray-900 hover:bg-blue-400 hover: cursor-pointer"
            }`}
          >
            {tab === "nfts" && "NFTs Owned"}
            {tab === "history" && "Battle History"}
            {tab === "rewards" && "Rewards Summary"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 p-4 rounded-b-2xl shadow-inner min-h-[800]">
        {selectedTab === "nfts" && (
          <div className="space-y-2">
            {armyData?.stacksByArmy?.[armyData.armies?.[0]]?.map((stack: any, i: number) => (
              <div key={i}>
                <h3 className="text-lg font-bold text-purple-300 mb-1">{stack.name}</h3>
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
          <div>
            <p className="text-gray-300">⚔️ Wins: TBD</p>
            <p className="text-gray-300">💀 Losses: TBD</p>
            <p className="text-gray-300">🟰 Draws: TBD</p>
            <p className="text-yellow-300">🏆 Worlds Conquered: TBD</p>
          </div>
        )}

        {selectedTab === "rewards" && (
          <div>
            <p className="text-green-300">💰 WAR4K Earned: 0</p>
            <p className="text-green-300">📈 Projected Daily: 0</p>
            <p className="text-green-300">🔒 Staking Bonus: 0%</p>
          </div>
        )}
      </div>
    </div>
  );
}
