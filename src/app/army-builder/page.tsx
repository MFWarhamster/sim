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
      <div className="p-6 text-white">
        <h1 className="text-5xl font-bold mb-2 flex justify-center text-shadow-lg/30 font-[Open_Sans]">ARMY BUILDER</h1>
    
        <div className="grid grid-cols-1 lg:grid-cols-3 border border-gray-800 gap-6 shadow-lg shadow-black bg-gray-900 rounded-2xl p-4">
    
          {/* 1. Available Units */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4">
            <h2 className="text-xl flex justify-center font-semibold p-4 text-shadow-lg/30 font-[Open_Sans]">AVAILABLE NFT</h2>
            <div className="flex space-x-3 mb-2">
              {Object.keys(filters).map((key) => (
                <button
                  key={key}
                  onClick={() => toggleFilter(key as keyof typeof filters)}
                  className={`px-5 py-1 shadow-lg rounded ${
                    filters[key as keyof typeof filters] ? "font-[Open_Sans] bg-green-600 hover:bg-green-500 hover: cursor-pointer" : "bg-gray-600 hover:bg-gray-500 hover: cursor-pointer"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
    
            <div className="bg-gray-700 space-y-2 max-h-[480px] overflow-y-auto rounded px-2 mb-4">
              {filteredNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="relative bg-gray-900 p-2 group shadow-sm rounded shadow-black mt-2 mb-2"
                  onMouseEnter={() => setHoveredNFT(nft)}
                  onMouseLeave={() => setHoveredNFT(null)}
                >
                  <div className="text-sm font-semibold font-[Open_Sans]">{nft.name}</div>
                  <div className="text-xs">Tier {nft.tier} | Cost {nft.cost} | {nft.legion}</div>
                  <button
                    onClick={() => addUnitToStack(nft)}
                    className="font-[Open_Sans] absolute top-2 right-2 bg-green-600 px-2 py-1 text-xs rounded hover:bg-green-800 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
    
          {/* 2. Stack Builder */}
          <div className="bg-gray-800 p-4 border border-gray-700 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex justify-center text-shadow-lg/30 font-[Open_Sans]">STACK BUILDER</h2>
            <div className="flex space-x-4 mb-4 justify-center">
              {stacks.map((stack, i) =>
                editingStackIndex === i ? (
                  <div key={i} className="flex space-x-4">
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
                      i === selectedStackIndex ? "font-[Open_Sans] bg-purple-600 border border-purple-600 hover:bg-purple-500 hover: cursor-pointer" : "bg-gray-700 hover:bg-gray-600 hover: cursor-pointer border border-gray-600"
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
              <div className="h-4 w-full bg-gray-600 rounded">
                <div
                  className="h-4 bg-green-500 rounded shadow-lg shadow-green-400/50"
                  style={{ width: `${(totalStats.cost / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>
    
          {/* 3. Army Review */}
          <div className="bg-gray-800 max-h-[600px] p-4 border border-gray-700 rounded-2xl space-y-4">
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
      <div className="mt-4 flex flex-col items-center justify-center">
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
          className="bg-green-600 shadow-lg shadow-green-800/50 mt-4 px-6 py-2 rounded-xl border border-green-500 hover:bg-green-500 hover: cursor-pointer"
        >
          <p className="text-2xl font-bold">Save Army</p>
        </button>
      </div>
    </div>
  );
};

export default ArmyBuilderPage;