"use client";

import { useEffect, useState } from "react";

interface NFT {
  id: number;
  name: string;
  tier: string;
  rank: string;
  type: string;
  cost: number;
  hp: number;
  speed: number;
  melee: number;
  ranged: number;
  allegiance: string;
  legion: string;
  world: string;
  powerRating: number;
}

interface Stack {
  id: number;
  name: string;
  units: NFT[];
}

interface Army {
  id: number;
  name: string;
  stacks: Stack[];
}

interface GridCell {
  attacker: NFT[];
  defender: NFT[];
}

export default function BattleGameplay() {
  const [attackerArmy, setAttackerArmy] = useState<NFT[]>([]);
  const [defenderArmy, setDefenderArmy] = useState<NFT[]>([]);
  const [grid, setGrid] = useState<GridCell[]>([]);

  useEffect(() => {
    const attackerData = localStorage.getItem("warhamsterArmies");
    const armies = attackerData ? JSON.parse(attackerData) : [];

    if (armies.length === 0) {
      alert("No saved armies found.");
      return;
    }

    const army: Army = armies[0]; // Always use Army 1 for now
    const mergedStacks = army.stacks.flatMap((s) => s.units);
    setAttackerArmy(mergedStacks);

    // Fetch all NFTs and create defender team
    fetch("/data/warhamster_nfts_with_power.json")
      .then((res) => res.json())
      .then((allNFTs: NFT[]) => {
        const attackerIds = new Set(mergedStacks.map((nft) => nft.id));
        const availableNFTs = allNFTs.filter((nft) => !attackerIds.has(nft.id));
        const selectedDefenders = [];

        const count = 6; // Number of defenders
        const pool = [...availableNFTs];

        for (let i = 0; i < count && pool.length > 0; i++) {
          const index = Math.floor(Math.random() * pool.length);
          selectedDefenders.push(pool[index]);
          pool.splice(index, 1);
        }

        setDefenderArmy(selectedDefenders);

        // Assign attackers to grid 0, defenders to grid 7
        const newGrid: GridCell[] = Array.from({ length: 8 }, () => ({
          attacker: [],
          defender: [],
        }));

        newGrid[0].attacker = mergedStacks;
        newGrid[7].defender = selectedDefenders;

        setGrid(newGrid);
      });
  }, []);

  return (
    <div className="container mx-auto py-10 text-white">
      <h1 className="text-4xl font-bold text-center mb-6">Warhamster Battle Simulation</h1>

      {/* Grid Display */}
      <div className="flex justify-center gap-2">
        {grid.map((cell, index) => (
          <div key={index} className="w-32 h-48 bg-gray-800 border rounded-md p-1 flex flex-col justify-between">
            <div>
              <h2 className="text-center text-sm mb-1">Grid {index + 1}</h2>
              {cell.attacker.map((unit) => (
                <div key={unit.id} className="bg-green-600 text-xs p-1 mb-1 rounded">
                  {unit.name}
                  <br />
                  HP: {unit.hp}
                </div>
              ))}
            </div>
            <div>
              {cell.defender.map((unit) => (
                <div key={unit.id} className="bg-red-600 text-xs p-1 mt-1 rounded">
                  {unit.name}
                  <br />
                  HP: {unit.hp}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-400 italic">Attacker starts at Grid 1. Defender starts at Grid 8.</p>
      </div>
    </div>
  );
}
