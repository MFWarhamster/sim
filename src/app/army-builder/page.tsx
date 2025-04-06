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
  attackStance: "Melee" | "Ranged";
  targetCommand: "Closest" | "Highest HP" | "Lowest HP";
}

interface Army {
  id: number;
  name: string;
  stacks: Stack[];
}

export default function ArmyBuilder() {
  const [allNFTs, setAllNFTs] = useState<NFT[]>([]);
  const [hoveredNFT, setHoveredNFT] = useState<NFT | null>(null);
  const [armies, setArmies] = useState<Army[]>([]);
  const [activeArmyId, setActiveArmyId] = useState<number>(0);
  const [activeStackId, setActiveStackId] = useState<number>(1);
  const stackCapacity = 20;

  const DEFAULT_ARMY = (): Army => ({
    id: Date.now(),
    name: `Army ${armies.length + 1}`,
    stacks: [
      { id: 1, name: "Stack 1", units: [], attackStance: "Melee", targetCommand: "Closest" },
      { id: 2, name: "Stack 2", units: [], attackStance: "Melee", targetCommand: "Closest" },
      { id: 3, name: "Stack 3", units: [], attackStance: "Melee", targetCommand: "Closest" },
    ],
  });

  useEffect(() => {
    const loadNFTs = async () => {
      try {
        const res = await fetch("/data/warhamster_nfts_with_power.json");
        if (!res.ok) throw new Error("Failed to fetch NFT data");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Data is not an array");
        console.log("✅ NFTs loaded:", data.length);
        setAllNFTs(data);
      } catch (err) {
        console.error("❌ Error loading NFT data:", err);
      }
    };

    const stored = localStorage.getItem("warhamsterArmies");
    if (stored) {
      const parsed = JSON.parse(stored);
      setArmies(parsed);
      setActiveArmyId(parsed[0]?.id || 0);
    } else {
      const defaultArmy = DEFAULT_ARMY();
      setArmies([defaultArmy]);
      setActiveArmyId(defaultArmy.id);
    }

    loadNFTs();
  }, []);

  const activeArmy = armies.find((a) => a.id === activeArmyId);
  const activeStack = activeArmy?.stacks.find((s) => s.id === activeStackId) || null;

  const updateStack = (updates: Partial<Stack>) => {
    setArmies((prev) =>
      prev.map((army) =>
        army.id === activeArmyId
          ? {
              ...army,
              stacks: army.stacks.map((stack) =>
                stack.id === activeStackId ? { ...stack, ...updates } : stack
              ),
            }
          : army
      )
    );
  };

  const updateStackName = (name: string) => {
    updateStack({ name });
  };

  const toggleNFT = (nft: NFT) => {
    if (!activeStack) return;
    const already = activeStack.units.find((u) => u.id === nft.id);
    const newUnits = already
      ? activeStack.units.filter((u) => u.id !== nft.id)
      : activeStack.units.reduce((sum, u) => sum + u.cost, 0) + nft.cost <= stackCapacity
      ? [...activeStack.units, nft]
      : (alert("Stack capacity exceeded"), activeStack.units);

    updateStack({ units: newUnits });
  };

  const saveArmies = () => {
    localStorage.setItem("warhamsterArmies", JSON.stringify(armies));
    alert("Army saved!");
  };

  const usedNFTIds = new Set(
    armies.flatMap((army) =>
      army.stacks.flatMap((s) =>
        army.id === activeArmyId && s.id === activeStackId
          ? []
          : s.units.map((u) => u.id)
      )
    )
  );

  const baseStats = activeStack?.units.reduce(
    (totals, nft) => ({
      hp: totals.hp + nft.hp,
      melee: totals.melee + nft.melee,
      ranged: totals.ranged + nft.ranged,
      speed: totals.speed + nft.speed,
      cost: totals.cost + nft.cost,
    }),
    { hp: 0, melee: 0, ranged: 0, speed: 0, cost: 0 }
  ) || { hp: 0, melee: 0, ranged: 0, speed: 0, cost: 0 };

  let matchedTraits = 0;
  let bonusMultiplier = 0;

  if (activeStack && activeStack.units.length >= 2) {
    const match = (key: keyof NFT) =>
      activeStack.units.every((n) => n[key] === activeStack.units[0][key]);

    matchedTraits = ["allegiance", "legion", "world"].filter((trait) =>
      match(trait as keyof NFT)
    ).length;

    bonusMultiplier = matchedTraits * 0.05;
  }

  const bonusStats = {
    hp: Math.round(baseStats.hp * bonusMultiplier),
    melee: Math.round(baseStats.melee * bonusMultiplier),
    ranged: Math.round(baseStats.ranged * bonusMultiplier),
  };

  const totalStats = {
    hp: baseStats.hp + bonusStats.hp,
    melee: baseStats.melee + bonusStats.melee,
    ranged: baseStats.ranged + bonusStats.ranged,
    speed: baseStats.speed,
    cost: baseStats.cost,
  };

  const powerRating =
    totalStats.hp + totalStats.melee + totalStats.ranged + totalStats.speed - totalStats.cost;

  return (
    <div className="container mx-auto py-10 text-white">
      <header className="mb-8">
        <nav className="flex justify-center gap-6 text-purple-400 font-semibold">
          <a href="/">Home</a>
          <a href="/profile">Profile</a>
          <a href="/marketplace">Marketplace</a>
          <a href="/dex">DEX</a>
          <a href="/battle">Battle</a>
        </nav>
      </header>

      <h1 className="text-4xl font-bold text-center mb-6">Army Builder</h1>

      {/* Army Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        {armies.map((army) => (
          <button
            key={army.id}
            onClick={() => {
              setActiveArmyId(army.id);
              setActiveStackId(1);
            }}
            className={`px-4 py-2 rounded ${
              army.id === activeArmyId ? "bg-purple-700" : "bg-gray-700 hover:bg-purple-500"
            }`}
          >
            {army.name}
          </button>
        ))}
        <button
          onClick={() => {
            const newArmy = DEFAULT_ARMY();
            setArmies([...armies, newArmy]);
            setActiveArmyId(newArmy.id);
            setActiveStackId(1);
          }}
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-500"
        >
          + Army
        </button>
      </div>

      {/* Stack Tabs */}
      <div className="text-center mb-4">
        {activeArmy?.stacks.map((stack) => (
          <button
            key={stack.id}
            onClick={() => setActiveStackId(stack.id)}
            className={`px-4 py-1 mx-1 rounded ${
              stack.id === activeStackId ? "bg-blue-600" : "bg-gray-700 hover:bg-blue-500"
            }`}
          >
            {stack.name}
          </button>
        ))}
      </div>

      {/* Stack Name */}
      <div className="text-center mb-6">
        <input
          type="text"
          value={activeStack?.name ?? ""}
          onChange={(e) => updateStackName(e.target.value)}
          className="text-black text-center rounded px-4 py-1 w-1/2"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Available Warhamsters */}
        <div className="bg-gray-800 p-4 rounded shadow-md relative">
          <h2 className="text-xl font-semibold mb-4">Available Warhamsters</h2>
          <div className="h-[500px] overflow-y-auto space-y-2">
            {allNFTs.map((nft) => {
              const inCurrent = activeStack?.units.find((u) => u.id === nft.id);
              const isUsedElsewhere = usedNFTIds.has(nft.id);
              const disabled = !inCurrent && isUsedElsewhere;

              return (
                <div
                  key={nft.id}
                  onMouseEnter={() => setHoveredNFT(nft)}
                  onMouseLeave={() => setHoveredNFT(null)}
                  className="relative"
                >
                  <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                    <div>
                      <p className="font-semibold">{nft.name}</p>
                      <p className="text-xs text-gray-400">
                        Tier {nft.tier} | Cost: {nft.cost}
                      </p>
                    </div>
                    <button
                      onClick={() => !disabled && toggleNFT(nft)}
                      disabled={disabled}
                      className={`px-3 py-1 text-sm rounded ${
                        inCurrent
                          ? "bg-red-600 hover:bg-red-700"
                          : disabled
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {inCurrent ? "Remove" : disabled ? "In Use" : "Add"}
                    </button>
                  </div>
                  {hoveredNFT?.id === nft.id && (
                    <div className="absolute z-10 bg-black text-white text-xs p-2 rounded border border-purple-600 shadow-lg top-full mt-1 w-72">
                      <p><strong>{nft.name}</strong></p>
                      <p>HP: {nft.hp}, Melee: {nft.melee}, Ranged: {nft.ranged}, Speed: {nft.speed}</p>
                      <p>Tier: {nft.tier}, Cost: {nft.cost}</p>
                      <p>Allegiance: {nft.allegiance}</p>
                      <p>Legion: {nft.legion}</p>
                      <p>World: {nft.world}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stack Summary */}
        <div className="bg-gray-800 p-6 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">Selected Stack</h2>

          {bonusMultiplier > 0 && (
            <p className="text-green-400 font-semibold">
              Moral Bonus: <span className="text-green-300">+{(bonusMultiplier * 100).toFixed(0)}%</span>
            </p>
          )}

          <p><strong>HP:</strong> {baseStats.hp} + <span className="text-green-400">{bonusStats.hp}</span></p>
          <p><strong>Melee:</strong> {baseStats.melee} + <span className="text-green-400">{bonusStats.melee}</span></p>
          <p><strong>Ranged:</strong> {baseStats.ranged} + <span className="text-green-400">{bonusStats.ranged}</span></p>
          <p><strong>Speed:</strong> {baseStats.speed}</p>
          <p><strong>Cost:</strong> {baseStats.cost}</p>
          <p><strong>Power Rating:</strong> <span className="text-purple-400">{powerRating}</span></p>

          <ul className="mt-4 space-y-1">
            {activeStack?.units.map((nft) => (
              <li key={nft.id} className="text-green-400 text-sm">
                ✅ {nft.name} ({nft.tier}-Tier)
              </li>
            ))}
          </ul>

          {/* Stack Settings */}
          <div className="mt-6 bg-gray-700 rounded p-4">
            <h3 className="font-bold mb-2">{activeStack?.name}</h3>
            <div className="flex gap-6">
              <label>
                <span className="text-sm">Stance:</span>
                <select
                  value={activeStack?.attackStance ?? "Melee"}
                  onChange={(e) =>
                    updateStack({ attackStance: e.target.value as any })
                  }
                  className="ml-2 text-black rounded px-2 py-1"
                >
                  <option value="Melee">Melee</option>
                  <option value="Ranged">Ranged</option>
                </select>
              </label>

              <label>
                <span className="text-sm">Target:</span>
                <select
                  value={activeStack?.targetCommand ?? "Closest"}
                  onChange={(e) =>
                    updateStack({ targetCommand: e.target.value as any })
                  }
                  className="ml-2 text-black rounded px-2 py-1"
                >
                  <option value="Closest">Closest</option>
                  <option value="Highest HP">Highest HP</option>
                  <option value="Lowest HP">Lowest HP</option>
                </select>
              </label>
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={saveArmies}
              className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded text-black font-bold"
            >
              SAVE ARMY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
