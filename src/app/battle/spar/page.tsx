"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NFT {
  id: number;
  name: string;
  tier?: string;
  cost: number;
  hp: number;
  maxHp?: number;
  melee: number;
  ranged: number;
  speed: number;
  position: number;
  side: "attacker" | "defender";
  attackStance: "Melee" | "Ranged";
  targetCommand: "Closest" | "Highest HP" | "Lowest HP";
  bonusVsTier?: { tier: string; value: number };
  ability?: {
    name: string;
    trigger: string;
    effect: string;
    target?: string;
    value: number;
    chance?: number;
    round?: number;
  };
}

export default function SparBattlePage() {
  const [units, setUnits] = useState<NFT[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [winner, setWinner] = useState<"attacker" | "defender" | null>(null);
  const [healedIds, setHealedIds] = useState<number[]>([]);
  const LOCAL_STORAGE_KEY = "warhamster_army_data";
  const savedArmyData = localStorage.getItem("warhamster_army_data");
  const armies = savedArmyData ? JSON.parse(savedArmyData).armies : [];
  const stacksByArmy = savedArmyData ? JSON.parse(savedArmyData).stacksByArmy : {};  
  const activeAbilities = armies[0]?.activeAbilities || {};

  const processAbility = (
    unit: NFT,
    roundNum: number,
    allies: NFT[],
    enemies: NFT[],
    log: string[],
    isDeath = false
  ) => {
    const ability = unit.ability;
    if (!ability || unit.hp <= 0) return;

    const {
      trigger,
      effect,
      value = 0,
      target = "",
      chance = 0.25,
      name: abilityName,
    } = ability;

    if (trigger === "onStart" && roundNum === 1) {
      if (effect === "bonusVsTier" && target) {
        unit.bonusVsTier = { tier: target, value };
        log.push(`${unit.name} activates ${abilityName} (+${value} vs ${target}-Tier)`);
      }
      if (effect === "healSelf") {
        unit.hp = Math.min(unit.hp + value, unit.maxHp || unit.hp);
        log.push(`${unit.name} activates ${abilityName} and heals +${value} HP`);
      }
    }

    if (trigger === "onChancePerRound" && Math.random() < chance) {
      if (effect === "dealAOE") {
        enemies.slice(0, 3).forEach((enemy) => (enemy.hp -= value));
        log.push(`${unit.name} activates ${abilityName} and hits enemies with AOE!`);
      }
      if (effect === "healArmy") {
        const healed: number[] = [];
        allies.forEach((ally) => {
          const maxHp = ally.maxHp || ally.hp;
          const newHp = Math.min(ally.hp + value, maxHp);
          if (newHp > ally.hp) healed.push(ally.id);
          ally.hp = newHp;
        });
        setHealedIds(healed);
        setTimeout(() => setHealedIds([]), 500);
        log.push(`${unit.name} activates ${abilityName} and heals allies for ${value} HP`);
      }
    }

    if (trigger === "onRandomRound") {
      if (!ability.round) {
        ability.round = Math.floor(Math.random() * 16) + 1;
      }
      if (roundNum === ability.round && effect === "dealAOE") {
        enemies.slice(0, 3).forEach((e) => (e.hp -= value));
        log.push(`${unit.name} activates ${abilityName} randomly on round ${roundNum}!`);
      }
    }

    if (trigger === "onDeath" && isDeath) {
      if (effect === "dealAOE") {
        enemies.slice(0, 3).forEach((e) => (e.hp -= value));
        log.push(`${unit.name}'s ${abilityName} triggers on death! 💥`);
      }
    }
  };
  useEffect(() => {
    const armyData = localStorage.getItem("warhamster_army_data");
    if (!armyData) return alert("No saved army.");
    const savedArmyData = localStorage.getItem("warhamster_army_data");
    if (!savedArmyData) {
      console.warn("No saved army data found in local storage.");
      return;
    }
    fetch("/data/warhamster_nfts_with_power_abilities_final.json")
    .then((res) => res.json())
    .then((nfts) => {
      const LOCAL_STORAGE_KEY = "warhamster_army_data";
      const savedArmyData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!savedArmyData) return console.warn("No saved army data found.");
      
      const { armies, stacksByArmy } = JSON.parse(savedArmyData);
      const activeArmyName = armies[0];
      const stacks = stacksByArmy[activeArmyName] || [];
      
      const attackerArmy: NFT[] = stacks.flatMap((stack: any) =>
        stack.units.map((unit: any) => ({
          ...unit,
          position: 1,
          side: "attacker",
          maxHp: unit.hp,
          attackStance: stack.stance ?? "Melee",
          targetCommand: stack.target ?? "Closest",
        }))
      );       

        const attackerIds = new Set(attackerArmy.map((u) => u.id));
        const available = nfts.filter((n: any) => !attackerIds.has(n.id));
        const defenderUnits: NFT[] = [];
  
        while (defenderUnits.length < 14 && available.length > 0) {
          const idx = Math.floor(Math.random() * available.length);
          const nft = available[idx];
          defenderUnits.push({
            ...nft,
            position: 8,
            side: "defender",
            maxHp: nft.hp,
            attackStance: "Melee",
            targetCommand: "Closest",
          });
          available.splice(idx, 1);
        }
  
        setUnits([...attackerArmy, ...defenderUnits]);
        setLog(["🟢 The enemy is waiting. Click 'BATTLE!' to begin."]);
      });
  }, []);

  const runBattle = async () => {
    let currentUnits = [...units];
    let isFighting = true;

    for (let r = 1; r <= 64; r++) {
      setRound(r);
      const roundLog: string[] = [`⚔️ Round ${r}`];

      const sorted = currentUnits.filter(u => u.hp > 0).sort((a, b) => b.speed - a.speed);

      for (const unit of sorted) {
        if (unit.hp <= 0) continue;

        const allies = currentUnits.filter(u => u.side === unit.side && u.hp > 0);
        const enemies = currentUnits.filter(u => u.side !== unit.side && u.hp > 0);

        processAbility(unit, r, allies, enemies, roundLog);

        if (enemies.length === 0) continue;

        let candidates = [...enemies];
        const dist = (a: NFT) => Math.abs(unit.position - a.position);

        if (unit.targetCommand === "Highest HP") {
          candidates.sort((a, b) => b.hp - a.hp);
        } else if (unit.targetCommand === "Lowest HP") {
          candidates.sort((a, b) => a.hp - b.hp);
        } else {
          candidates.sort((a, b) => dist(a) - dist(b));
        }

        const target = candidates[0];
        const range = Math.abs(unit.position - target.position);

        let bonusDamage = 0;
        if (unit.bonusVsTier && target.tier === unit.bonusVsTier.tier) {
          bonusDamage = unit.bonusVsTier.value;
          roundLog.push(`${unit.name} gains +${bonusDamage} vs ${target.tier}-Tier`);
        }

        if (unit.attackStance === "Melee") {
          if (range === 1) {
            target.hp -= unit.melee + bonusDamage;
            roundLog.push(`${unit.name} hits ${target.name} for ${unit.melee + bonusDamage} melee damage`);
          } else {
            if (unit.side === "attacker" && unit.position < 8) unit.position++;
            if (unit.side === "defender" && unit.position > 1) unit.position--;
            roundLog.push(`${unit.name} moves to ${unit.position}`);
          }
        }

        if (unit.attackStance === "Ranged") {
          if (range === 2) {
            target.hp -= unit.ranged + bonusDamage;
            roundLog.push(`${unit.name} fires at ${target.name} for ${unit.ranged + bonusDamage} ranged damage`);
          } else if (range === 1) {
            const fallback = unit.side === "attacker" ? unit.position - 1 : unit.position + 1;
            if (fallback >= 1 && fallback <= 8) {
              unit.position = fallback;
              roundLog.push(`${unit.name} fell back to ${unit.position}`);
            } else {
              target.hp -= unit.melee;
              roundLog.push(`${unit.name} is cornered and hits ${target.name} for ${unit.melee}`);
            }
          } else {
            if (unit.side === "attacker" && unit.position < 8) unit.position++;
            if (unit.side === "defender" && unit.position > 1) unit.position--;
            roundLog.push(`${unit.name} advanced to ${unit.position}`);
          }
        }

        if (target.hp <= 0) {
          roundLog.push(`💀 ${target.name} was defeated`);
          processAbility(target, r, [], [], roundLog, true);
        }
      }

      currentUnits = [...currentUnits];
      setUnits(currentUnits);
      setLog((prev) => [...roundLog, ...prev]);

      const attackers = currentUnits.filter(u => u.side === "attacker" && u.hp > 0);
      const defenders = currentUnits.filter(u => u.side === "defender" && u.hp > 0);

      if (attackers.length === 0 || defenders.length === 0) {
        const finalWinner = attackers.length > 0 ? "attacker" : "defender";
        setWinner(finalWinner);
        setLog((prev) => [`🏁 Battle over! ${finalWinner} wins`, ...prev]);
        localStorage.setItem("warhamsterLastBattle", JSON.stringify(currentUnits));
        isFighting = false;
        break;
      }

      await new Promise((res) => setTimeout(res, 1000));
    }

    if (isFighting) {
      setWinner(null);
      localStorage.setItem("warhamsterLastBattle", JSON.stringify(currentUnits));
    }
  };
  const renderArmyStats = (side: "attacker" | "defender") => {
    const army = units.filter((u) => u.side === side && u.hp > 0);
    const baseStats = army.reduce(
      (totals, u) => ({
        hp: totals.hp + u.hp,
        melee: totals.melee + u.melee,
        ranged: totals.ranged + u.ranged,
        speed: totals.speed + u.speed,
        cost: totals.cost + (u.cost || 0),
      }),
      { hp: 0, melee: 0, ranged: 0, speed: 0, cost: 0 }
    );

    const power =
      baseStats.hp + baseStats.melee + baseStats.ranged + baseStats.speed - baseStats.cost;

    return (
      <>
        <p><strong>HP:</strong> {baseStats.hp}</p>
        <p><strong>Melee:</strong> {baseStats.melee}</p>
        <p><strong>Ranged:</strong> {baseStats.ranged}</p>
        <p><strong>Speed:</strong> {baseStats.speed}</p>
        <p><strong>Cost:</strong> {baseStats.cost}</p>
        <p><strong>Power Rating:</strong> <span className="text-purple-400">{power}</span></p>
        <ul className="mt-2 text-sm text-green-400">
        {army.map((u) => (
            <li key={u.id}>✅ {u.name} ({u.tier || "?"}-Tier)</li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <style jsx global>{`
        .heal-glow {
          animation: healPulse 0.6s ease-out;
        }

        @keyframes healPulse {
          0% { box-shadow: 0 0 0px 0px #00ff88; }
          50% { box-shadow: 0 0 10px 5px #00ff88; }
          100% { box-shadow: 0 0 0px 0px transparent; }
        }
      `}</style>

      <div className="container text-center mx-auto py-4">
        <h1 className="text-6xl yellow-700 font-bold text-center mb-6">SPAR</h1>
        <button className="bg-purple-600 mb-6 border shadow-lg shadow-purple-700/50 hover:bg-purple-700 px-6 py-1 rounded text-white font-bold text-l"><Link href="/battle">Withdraw</Link></button>
        {/* Battlefield Grid */}
        <div className="flex justify-center gap-2 mb-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-32 min-h-[30vh] max-h-[30vh] overflow-y-auto bg-gray-800 border p-1 rounded">
              <h2 className="text-sm text-center mb-1">Grid {i + 1}</h2>
              {units
                .filter((u) => u.position === i + 1 && u.hp > 0)
                .map((u) => (
                  <div
                    key={u.id}
                    className={`text-xs p-1 mb-1 rounded ${
                      u.side === "attacker" ? "bg-green-600" : "bg-red-600"
                    } ${healedIds.includes(u.id) ? "heal-glow" : ""}`}
                  >
                    <strong>{u.name}</strong>
                    <br />
                    HP: {u.hp} / {u.maxHp ?? u.hp}
                  </div>
                ))}
            </div>
          ))}
        </div>
{/* Fight Button */}
{!winner && (
  <div className="text-center mb-6">
    <button
      onClick={runBattle}
      className="bg-red-600 border shadow-lg shadow-red-700/50 hover: cursor-pointer px-6 py-1 rounded text-white font-bold text-xl"
    >
      BATTLE!
    </button>
  </div>
)}

{/* Victory */}
{winner && (
  <div className="text-center text-2xl font-bold my-6 text-yellow-400">
    🏆 {winner === "attacker" ? "Attacker Victory!" : "Defender Victory!"}
    <p className="text-sm text-gray-300 mt-1">Final Round: {round}</p>
  </div>
)}

{/* Stats + Log */}
<div className="grid md:grid-cols-3 gap-6 mt-10">
  <div className="bg-gray-800 rounded p-4">
    <h3 className="text-lg font-bold mb-2">🟢 Attacker</h3>
    {renderArmyStats("attacker")}
  </div>

  <div className="bg-gray-900 rounded p-4">
    <h2 className="text-xl font-semibold mb-2">📜 Battle Log</h2>
    <div className="h-64 overflow-y-auto text-sm space-y-1">
      {log.map((entry, idx) => (
        <div key={idx} className="text-gray-300">{entry}</div>
      ))}
    </div>
  </div>

  <div className="bg-gray-800 rounded p-4">
    <h3 className="text-lg font-bold mb-2">🔴 Defender</h3>
    {renderArmyStats("defender")}
  </div>
</div>
</div>
</div>
);
}