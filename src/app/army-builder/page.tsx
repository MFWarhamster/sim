"use client";

import React, { useState, useEffect } from "react";

interface NFT {
  id: string;
  name: string;
  hp: number;
  melee: number;
  ranged: number;
  speed: number;
  power: number;
  cost: number;
  tier: string;
  allegiance: string;
  legion: string;
  world: string;
  image: string;
}
interface Stack {
  name: string;
  units: NFT[];
  stance: "Melee" | "Ranged";
  target: "Closest" | "Highest HP" | "Lowest HP" | "Highest Attack" | "Highest Speed";
}
const LOCAL_STORAGE_KEY = "warhamster_army_data";

const ArmyBuilderPage = () => {
  const [armies, setArmies] = useState<string[]>(["Army 1"]);
  const [selectedArmyIndex, setSelectedArmyIndex] = useState(0);
  const [stacksByArmy, setStacksByArmy] = useState<{ [key: string]: Stack[] }>({
    "Army 1": [
      { name: "Stack 1", units: [], stance: "Melee", target: "Closest" },
      { name: "Stack 2", units: [], stance: "Melee", target: "Closest" },
      { name: "Stack 3", units: [], stance: "Melee", target: "Closest" },
    ],
  });
  const [selectedStackIndex, setSelectedStackIndex] = useState(0);
  const [allNFTs, setAllNFTs] = useState<NFT[]>([]);
  const [filters, setFilters] = useState({ STier: true, ATier: true, BTier: true, Good: true, Bad: true });
  const [hoveredNFT, setHoveredNFT] = useState<NFT | null>(null);
  const [editingArmyName, setEditingArmyName] = useState(false);
  const [editingStackIndex, setEditingStackIndex] = useState<number | null>(null);
  const [newArmyName, setNewArmyName] = useState("");
  const [newStackName, setNewStackName] = useState("");
  const selectedArmy = armies[selectedArmyIndex];
  const allArmyUnits = stacksByArmy[selectedArmy]?.flatMap((stack) => stack.units) || [];
  const stacks = stacksByArmy[selectedArmy] || [];
  const selectedStack = stacks[selectedStackIndex] || null;
  if (!selectedStack) return null;  
  const _addNewStack = ()  => {  // Placeholder for future implementation
    setStacksByArmy((prevStacksByArmy) => {
      const currentStacks: Stack[] = prevStacksByArmy[selectedArmy] || [];

      const newStack: Stack = {
        name: `Stack ${currentStacks.length + 1}`,
        units: [],
        stance: "Melee",
        target: "Closest",
      };

      const _updatedStacks = {  // Placeholder for future implementation
        ...prevStacksByArmy,
        [selectedArmy]: [...currentStacks, newStack]
      };

      return {
        ...prevStacksByArmy,
        [selectedArmy]: [...currentStacks, newStack],
      };
    });
  }

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ armies, stacksByArmy }));
  }, [armies, stacksByArmy]);
  
  useEffect(() => {
    const loadNFTs = async () => {
      const res = await fetch("/data/warhamster_nfts_with_power_abilities_final.json");
      const json = await res.json();
      setAllNFTs(json);
    };

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.armies && parsed.stacksByArmy) {
        setArmies(parsed.armies);
        setStacksByArmy(parsed.stacksByArmy);
      }
    }

    loadNFTs();
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ armies, stacksByArmy }));
  };

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  const usedNFTIds = new Set(stacks.flatMap((stack) => stack.units.map((unit) => unit.id)));
  const updateStackOption = (key: "stance" | "target", value: string) => {
    const updatedStacks = stacks.map((stack, idx) =>
      idx === selectedStackIndex ? { ...stack, [key]: value } : stack
    );
    setStacksByArmy({ ...stacksByArmy, [selectedArmy]: updatedStacks });
    saveToLocalStorage();
  };

  const filteredNFTs = allNFTs.filter((nft) => {
    return (
      !usedNFTIds.has(nft.id) &&
      (filters.STier || nft.tier !== "S") &&
      (filters.ATier || nft.tier !== "A") &&
      (filters.BTier || nft.tier !== "B") &&
      (filters.Good || nft.allegiance !== "Good") &&
      (filters.Bad || nft.allegiance !== "Bad")
    );
  });
  const updateArmyName = () => {
    const updatedArmies = [...armies];
    const oldName = armies[selectedArmyIndex];
    const newName = newArmyName;
  
    // Rename army
    updatedArmies[selectedArmyIndex] = newName;
    setArmies(updatedArmies);
  
    const updatedStacksByArmy = { ...stacksByArmy };
    updatedStacksByArmy[newName] = updatedStacksByArmy[oldName];
    delete updatedStacksByArmy[oldName];
    setStacksByArmy(updatedStacksByArmy);
  
    setEditingArmyName(false);
    saveToLocalStorage();
  };  
  const addUnitToStack = (nft: NFT) => {
    if (totalStats.cost + nft.cost > 20) return;
    const updated = [...selectedStack.units, nft];
    const newStacks = [...stacks];
    newStacks[selectedStackIndex] = { ...selectedStack, units: updated };
    setStacksByArmy({ ...stacksByArmy, [selectedArmy]: newStacks });
    saveToLocalStorage();
  };

  const baseStats = selectedStack?.units.reduce(
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

  if (selectedStack && selectedStack.units.length >= 2) {
    const match = (key: keyof NFT) =>
      selectedStack.units.every((n) => n[key] === selectedStack.units[0][key]);

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
    
    const armyStats = stacks.reduce(
      (acc, stack) => {
        stack.units.forEach(nft => {
          acc.hp += nft.hp;
          acc.melee += nft.melee;
          acc.ranged += nft.ranged;
          acc.speed += nft.speed;
          acc.power += nft.power;
          acc.cost += nft.cost;
        });
        return acc;
      },
      { hp: 0, melee: 0, ranged: 0, speed: 0, power: 0, cost: 0 }
    );

    return (
      <div className="p-6 text-white font-[Open_Sans]">
        <h1 className="text-5xl font-bold mb-2 flex justify-center text-shadow-lg/30 font-[Open_Sans]">ARMY BUILDER</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border border-gray-950/5 p-1 inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 shadow-lg shadow-black rounded-2xl min-h-[620] max-h-620">
    
          {/* 1. Available Units */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 shadow-md shadow-black">
            <h2 className="text-xl flex justify-center font-semibold p-4 text-shadow-lg/30 font-[Open_Sans]">AVAILABLE NFT</h2>
            <div className="flex space-x-2 mb-2 flex justify-center rounded-xl p-1 inset-ring inset-ring-black dark:bg-gray-900 dark:inset-ring-white/10 text-white font-[Open_Sans]">
              {Object.keys(filters).map((key) => (
                <button
                  key={key}
                  onClick={() => toggleFilter(key as keyof typeof filters)}
                  className={`px-5 py-1 shadow-lg rounded ${
                    filters[key as keyof typeof filters] ? "bg-green-700 p-2 px-4 inset-ring inset-ring-green-600 shadow-sm shadow-black hover:shadow-lg hover:shadow-green-500 hover:bg-green-300" : "bg-gray-600 hover:bg-gray-500 hover: cursor-pointer"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
    
            <div className="bg-gray-700 space-y-2 max-h-[480px] overflow-y-auto rounded px-2 mb-4 border border-gray-900 insert-shadow-sm">
              {filteredNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="relative bg-gray-900 p-2 group border-t-1 border-gray-500 shadow-sm shadow-gray-800 mt-2 mb-2 rounded"
                  onMouseEnter={() => setHoveredNFT(nft)}
                  onMouseLeave={() => setHoveredNFT(null)}
                >
                  <div className="text-sm font-semibold font-[Open_Sans]">{nft.name}</div>
                  <div className="text-xs">Tier {nft.tier} | Cost {nft.cost} | {nft.legion}</div>
                  <button
                    onClick={() => addUnitToStack(nft)}
                    className="font-[Open_Sans] absolute top-2 right-2 rounded bg-green-700 px-2 inset-ring inset-ring-green-600 shadow-sm shadow-black hover:shadow-md hover:shadow-green-500 hover:bg-green-300 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
    
          {/* 2. Stack Builder */}
          <div className="bg-gray-800 p-4 border border-gray-700 rounded-2xl shadow-md shadow-black">
            <h2 className="text-xl font-semibold mb-4 flex justify-center text-shadow-lg/30 font-[Open_Sans]">STACK BUILDER</h2>
            <div className="flex space-x-2 mb-2 flex justify-center rounded-xl p-1 inset-ring inset-ring-black dark:bg-gray-900 dark:inset-ring-white/10 text-white font-[Open_Sans]">
              {stacks.map((stack, i) =>
                editingStackIndex === i ? (
                  <div key={i} className="flex space-x-">
                    <input
                      className="text-white p-1 rounded"
                      value={newStackName}
                      onChange={(e) => setNewStackName(e.target.value)}
                    />
                    <button
                      onClick={() => {
                        const updatedStacks = [...stacks];
                        updatedStacks[i].name = newStackName;
                        setStacksByArmy({ ...stacksByArmy, [selectedArmy]: updatedStacks });
                        setEditingStackIndex(null);
                        saveToLocalStorage();
                      }}
                      className="bg-blue-600 px-2 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    key={i}
                    onClick={() => setSelectedStackIndex(i)}
                    onDoubleClick={() => {
                      setEditingStackIndex(i);
                      setNewStackName(stack.name);
                    }}
                    className={`px-4 py-2 shadow-lg rounded ${
                      i === selectedStackIndex ? "bg-green-700 p-1 px-6 inset-ring inset-ring-green-600 shadow-sm shadow-green-600 rounded-l hover:bg-green-600" : "bg-gray-700 hover:shadow-lg hover:shadow-green-500 hover:bg-green-400 hover: cursor-pointer"
                    }`}
                  >
                    {stack.name}
                  </button>
                )
              )}
            </div>
    
            <h2 className="text-xl font-semibold mb-2 font-[Open_Sans]">Selected Stack</h2>
            {bonusMultiplier > 0 && (
              <p className="text-green-500 font-semibold font-[Open_Sans]">
                Moral Bonus: <span className="text-green-350">+{(bonusMultiplier * 100).toFixed(0)}%</span>
              </p>
            )}
            <p><strong>HP:</strong> {baseStats.hp} + <span className="text-green-400">{bonusStats.hp}</span></p>
            <p><strong>Melee:</strong> {baseStats.melee} + <span className="text-green-400">{bonusStats.melee}</span></p>
            <p><strong>Ranged:</strong> {baseStats.ranged} + <span className="text-green-400">{bonusStats.ranged}</span></p>
            <p><strong>Speed:</strong> {baseStats.speed}</p>
            <p><strong>Cost:</strong> {baseStats.cost}</p>
            <p><span className="text-yellow-400 font-bold font-[Open_Sans]">POWER:</span> {powerRating}</p>
    
            <div className="mt-4 space-y-1 font-[Open_Sans]">
              {selectedStack.units.map((nft, i) => (
                <div key={i} className="flex justify-between items-center text-yellow-300">
                  <p>{nft.name} ({nft.tier}-Tier)</p>
                  <button
                    onClick={() => {
                      const updatedUnits = selectedStack.units.filter((_, index) => index !== i);
                      const newStacks = [...stacks];
                      newStacks[selectedStackIndex] = { ...selectedStack, units: updatedUnits };
                      setStacksByArmy({ ...stacksByArmy, [selectedArmy]: newStacks });
                      saveToLocalStorage();
                    }}
                    className="ml-4 bg-red-900 px-2 hover:bg-red-600 hover: cursor-pointer rounded border border-red-700 text-white shadow-lg font-[Open_Sans]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
    
            <div className="mt-4">
              <label className="mr-2 font-[Open_Sans]">Stance:</label>
              <select
                className="text-green-400 hover:cursor-pointer"
                value={selectedStack.stance || "Melee"}
                onChange={(e) => updateStackOption("stance", e.target.value)}
              >
                <option value="Melee">Melee</option>
                <option value="Ranged">Ranged</option>
              </select>
    
              <label className="ml-4 mr-2 font-[Open_Sans]">Target:</label>
              <select
                className="text-green-400 hover:cursor-pointer"
                value={selectedStack.target || "Closest"}
                onChange={(e) => updateStackOption("target", e.target.value)}
              >
                <option value="Closest">Closest</option>
                <option value="Highest HP">Highest HP</option>
                <option value="Lowest HP">Lowest HP</option>
                <option value="Highest Attack">Highest Attack</option>
                <option value="Highest Speed">Highest Speed</option>
              </select>
            </div>
    
            <div className="mt-4 font-[Open_Sans]">
              <p>Capacity: {totalStats.cost}/20</p>
              <div className="mt-2 h-6 rounded-xl w-full inset-ring inset-ring-gray-500/50 dark:bg-gray-950/50 dark:inset-ring-gray-500/30">
                <div
                  className="h-6 bg-green-500 rounded-xl shadow-lg shadow-green-400/50"
                  style={{ width: `${(totalStats.cost / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>
    
          {/* 3. Army Review */}
          <div className="bg-gray-800 max-h-[620px] p-4 border border-gray-700 rounded-2xl space-y-4 shadow-md shadow-black">
            <h1 className="text-xl font-bold mb-2 flex justify-center text-shadow-lg/30 font-[Open_Sans]">ARMY REVIEW</h1>
    
            {/* Army Tabs */}
            <div className="flex space-x-2 mb-4 border-b-2 border-purple-600">
              {armies.map((army, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedArmyIndex(i);
                    setSelectedStackIndex(0);
                  }}
                  className={`w-full px-4 rounded-t-lg py-2 ${
                    i === selectedArmyIndex ? "bg-purple-600 hover:bg-purple-500 hover: cursor-pointer" : "bg-gray-700"
                  }`}
                >
                  {army}
                </button>
              ))}
              <button
                onClick={() => {
                  const newName = `Army ${armies.length + 1}`;
                  setArmies([...armies, newName]);
                  setStacksByArmy({
                    ...stacksByArmy,
                    [newName]: [{
                      name: "Stack 1",
                      units: [],
                      stance: "Melee",
                      target: "Closest"
                    }]
                  });
                  setSelectedArmyIndex(armies.length);
                  setSelectedStackIndex(0);
                }}
                className="w-full bg-green-600 hover:bg-green-500 hover: cursor-pointer px-4 py-2 rounded-t-lg"
              >
                + Army
              </button>
            </div>
    
            {/* Rename + Stats */}
            {editingArmyName ? (
              <div className="flex space-x-2">
                <input
                  className="text-white p-1"
                  value={newArmyName}
                  onChange={(e) => setNewArmyName(e.target.value)}
                />
                <button onClick={updateArmyName} className="bg-blue-600 px-2 py-1 rounded">Save</button>
              </div>
            ) : (
              <h2
                className="text-xl font-semibold cursor-pointer font-[Open_Sans]"
                onDoubleClick={() => {
                  setNewArmyName(selectedArmy);
                  setEditingArmyName(true);
                }}
              >
                {selectedArmy}
              </h2>
            )}
    
            <div className="text-sm text-white mt-4 font-[Open_Sans]">
              <p><span className="text-purple-400 font-bold font-[Open_Sans]">Stats</span></p>
              <p><strong>HP:</strong> {armyStats.hp}</p>
              <p><strong>Melee:</strong> {armyStats.melee}</p>
              <p><strong>Ranged:</strong> {armyStats.ranged}</p>
              <p><strong>Speed:</strong> {armyStats.speed}</p>
              <p><strong>Cost:</strong> {armyStats.cost}</p>
              <p><span className="text-yellow-400 font-bold font-[Open_Sans]">POWER:</span> {armyStats.hp + armyStats.melee + armyStats.ranged + armyStats.speed - armyStats.cost}</p>
            </div>
    
            {stacksByArmy[selectedArmy]?.map((stack, stackIndex) => (
              <div key={stackIndex} className="mb-2">
                <h4 className="text-purple-300 font-semibold text-sm mb-1 font-[Open_Sans]">{stack.name}</h4>
                {stack.units.length === 0 ? (
                  <p className="text-gray-400 italic text-xs">Empty</p>
                ) : (
                  stack.units.map((nft, i) => (
                    <p key={i} className="text-yellow-300 text-xs font-[Open_Sans]">{nft.name} ({nft.tier}-Tier)</p>
                  ))
                )}
              </div>
            ))}
          </div>
    
        </div>     

      {/* Tooltip (Always Visible) + Save Button */}
      <div className="mt-4 flex flex-col gap-2 flex justify-center items-center rounded-xl bg-gray-950/5 p-1 inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 p-8 text-white font-[Open_Sans] max-w-screen shadow-lg shadow-black">
        <div className="p-3 bg-gray-800 rounded-xl text-sm space-y-1 min-h-[170px] min-w-[500px]">
          {hoveredNFT ? (
            <>
              <p><strong>{(hoveredNFT as NFT).name}</strong></p>
              <p>
                HP: {(hoveredNFT as NFT).hp} | Melee: {(hoveredNFT as NFT).melee} | Ranged: {(hoveredNFT as NFT).ranged} | Speed: {(hoveredNFT as NFT).speed}
              </p>
              <p>Tier: {(hoveredNFT as NFT).tier} | Cost: {(hoveredNFT as NFT).cost}</p>
              <p>Allegiance: {(hoveredNFT as NFT).allegiance}</p>
              <p>Legion: {(hoveredNFT as NFT).legion}</p>
              <p>World: {(hoveredNFT as NFT).world}</p>
            </>
          ) : (
            <p className="text-gray-400 italic">Hover over a unit to see its stats.</p>
          )}
        </div>

        <button
          onClick={saveToLocalStorage}
          className="p-1 px-8 inset-ring inset-ring-gray-950/5 dark:bg-green-600 dark:inset-ring-green-400 rounded-2xl shadow-md shadow-green-800 hover:shadow-lg hover:shadow-green-500 hover:bg-green-300 hover:inset-shadow-sm hover:inset-shadow-lime-200 hover: cursor-pointer"
        >
          <p className="text-2xl font-black font-[Open_Sans]">SAVE</p>
        </button>
      </div>
    </div>
  );
};

export default ArmyBuilderPage;