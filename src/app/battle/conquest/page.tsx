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
    const worldsData = JSON.parse(localStorage.getItem("warhamster_worlds_data") || "[]");
    const armyData = JSON.parse(localStorage.getItem("warhamster_army_data") || "{}");

    if (armyData.armies && armyData.stacksByArmy) {
      const activeArmyName = armyData.armies[0];
      const playerStacks = armyData.stacksByArmy[activeArmyName] || [];

      const totalPlayerPower = playerStacks.flatMap((stack: any) => stack.units)
        .reduce((total: number, unit: any) => total + (Number(unit.power) || 0), 0);

      setPlayerPower(totalPlayerPower);
    }

    setWorlds(worldsData);
  }, []);

  const canAttack = (worldPower: number) => Math.abs(playerPower - worldPower) <= worldPower * 0.25;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">🌎 Conquest Mode</h1>
      <div className="mb-4">Your Army's Power Rating: {playerPower}</div>
      <ul>
        {worlds.map(world => (
          <li key={world.id} className="p-2 mb-2 border rounded bg-gray-800">
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
  );
}

