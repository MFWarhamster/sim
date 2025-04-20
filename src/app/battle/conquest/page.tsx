"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface World {
  id: string;
  name: string;
  owner: string;
  powerRating: number;
}

export default function ConquestPage() {
  const router = useRouter();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [playerPower, setPlayerPower] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const worldsData = JSON.parse(localStorage.getItem("warhamster_worlds_data") || "[]");
      const armyData = JSON.parse(localStorage.getItem("warhamster_army_data") || "{}");

      if (armyData.armies?.length && armyData.stacksByArmy) {
        const activeArmyName = armyData.armies[0];
        const playerStacks = armyData.stacksByArmy[activeArmyName] || [];

        const totalPlayerPower = playerStacks
          .flatMap((stack: any) => stack.units || [])
          .reduce((total: number, unit: any) => total + (Number(unit.power) || 0), 0);

        setPlayerPower(totalPlayerPower);
      }

      setWorlds(worldsData);
    } catch (err) {
      console.error("LocalStorage parsing failed:", err);
    }
  }, []);  

  const canAttack = (worldPower: number) => Math.abs(playerPower - worldPower) <= worldPower * 0.25;

  return (
    <div className="p-6 text-white flex justify-center">
  <div className="flex flex-col gap-2 flex justify-center rounded-xl bg-gray-950/5 p-1 inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 p-8 text-white font-[Open_Sans] max-w-[800] shadow-lg shadow-black">
      <h1 className="text-3xl font-black mb-4 flex justify-center font-[Open_Sans]">CONQUEST</h1>
      <div className="text-white flex justify-center">Your Army's Power Rating: {playerPower}</div>
      <ul>
        {worlds.map(world => (
          <li key={world.id} className="grid md:grid-cols-3 border border-gray-950/5 inset-ring inset-ring-gray-950/5 dark:bg-gray-900 dark:inset-ring-white/10 gap-4 shadow-lg shadow-black rounded-2xl p-3 mt-2">
            <h2>{world.name}</h2>
            <p>Owner: {world.owner}</p>
            <p>Power Rating: {world.powerRating}</p>
            {canAttack(world.powerRating) && world.owner !== "Player" ? (
              <button
                className="mt-2 px-4 py-1 bg-green-600 rounded"
                onClick={() => router.push(`/battle/conquest/${world.id}`)}
              >
                ⚔️ Attack!
              </button>
            ) : (
              <span className="text-red-400">Not eligible to attack</span>
            )}
            {world.owner === "Player" && <span className="text-yellow-400 ml-2">Owned by you ✔️</span>}
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}
