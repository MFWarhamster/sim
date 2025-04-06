"use client";

import { useEffect, useState } from "react";

interface NFT {
  id: number;
  name: string;
  tier?: string;
  cost?: number;
  hp: number;
  melee: number;
  ranged: number;
  speed: number;
  position: number;
  side: "attacker" | "defender";
  attackStance: "Melee" | "Ranged";
  targetCommand: "Closest" | "Highest HP" | "Lowest HP";
  ability?: {
    name: string;
    trigger: string;
    effect: string;
    target?: string;
    value: number;
    chance?: number;
    round?: number;
  };
  bonusVsTier?: { tier: string; value: number };
}

export default function BattlePage() {
  const [units, setUnits] = useState<NFT[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [isFighting, setIsFighting] = useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [winner, setWinner] = useState<"attacker" | "defender" | null>(null);

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
      name: abilityName
    } = ability;
  
    // 🎯 onStart
    if (trigger === "onStart" && roundNum === 1) {
      if (effect === "bonusVsTier" && target) {
        unit.bonusVsTier = { tier: target, value };
        log.push(`${unit.name} activates ${abilityName}! +${value} vs ${target}-Tier!`);
      }
      if (effect === "bonusVsDefender" && target) {
        unit.bonusVsTier = { tier: target, value };
        log.push(`${unit.name} activates ${abilityName}! +${value} vs ${target}-Defender!`);
      }  
      if (effect === "healSelf") {
        unit.hp += value;
        log.push(`${unit.name} activates ${abilityName} Heals +${value} HP.`);
      }
      if (effect === "dealAOE") {
        enemies.slice(0, 3).forEach(e => e.hp -= value);
        log.push(`${unit.name} explodes in death with ${abilityName}`);
      }
    }
      // 🎯 onDeath
      if (trigger === "onDeath" && isDeath) {    
        if (effect === "healSelf") {
          unit.hp += value;
          log.push(`${unit.name} activates ${abilityName} Not Today +${value} HP!`);
        }
          if (effect === "dealAOE") {
            enemies.slice(0, 3).forEach(e => e.hp -= value);
            log.push(`${unit.name} explodes in death with ${abilityName}`);
          }
          if (effect === "healArmy") {
            enemies.slice(0, 3).forEach(e => e.hp += value);
            log.push(`${unit.name} inspires ${abilityName}`);
          }
        }        
    // 🔁 onChancePerRound
    if (trigger === "onChancePerRound" && Math.random() < chance) {
      if (effect === "dealAOE") {
        const damaged = enemies.slice(0, 3);
        damaged.forEach((enemy) => (enemy.hp -= value));
        log.push(`${unit.name} activates ${abilityName} and hits multiple enemies!`);
      } 
      if (effect === "healArmy") {
        allies.forEach((ally) => {
          ally.hp += value;
        });
        log.push(`${unit.name} activates ${abilityName} and heals his army! 🛡️ +${value} HP`);
      }
      if (effect === "speedArmy") {
        allies.forEach((ally) => {
          ally.speed += value;
          ally.melee += value;
        });
        log.push(`${unit.name} activates ${abilityName} and strikes!⚡️ +${value} HP & Speed`);
      }
    }
  
    // 🔀 onRandomRound
    if (trigger === "onRandomRound") {
      if (!ability.round) {
        ability.round = Math.floor(Math.random() * 16) + 1;
      }
      if (roundNum === ability.round && effect === "dealAOE") {
        const targets = enemies.slice(0, 3);
        targets.forEach((e) => (e.hp -= value));
        log.push(`${unit.name} activates ${abilityName} and unleashes hell at round ${roundNum}! 🌩️`);
      }
    }
  };
  
  useEffect(() => {
    const armyData = localStorage.getItem("warhamsterArmies");
    if (!armyData) return alert("No saved army.");

    fetch("/data/warhamster_nfts_with_power.json")
      .then((res) => res.json())
      .then((nfts) => {
        const armies = JSON.parse(armyData);
        const stacks = armies[0]?.stacks || [];
        const attackerArmy: NFT[] = stacks.flatMap((stack: any) =>
          stack.units.map((unit: any) => ({
            ...unit,
            position: 1,
            side: "attacker",
            attackStance: stack.attackStance || "Melee",
            targetCommand: stack.targetCommand || "Closest",
          }))
        );

        const attackerIds = new Set(attackerArmy.map((u) => u.id));
        const available = nfts.filter((n: any) => !attackerIds.has(n.id));
        const defenderUnits: NFT[] = [];

        while (defenderUnits.length < 11 && available.length > 0) {
          const idx = Math.floor(Math.random() * available.length);
          const nft = available[idx];
          defenderUnits.push({
            ...nft,
            position: 8,
            side: "defender",
            attackStance: "Ranged",
            targetCommand: "Closest",
          });
          available.splice(idx, 1);
        }

        setUnits([...attackerArmy, ...defenderUnits]);
        setLog(["🟢 Battle is ready. Click 'Fight!' to begin."]);
      });
  }, []);
  const runBattle = async () => {
    if (isFighting) return;

    setIsFighting(true);
    setBattleStarted(true);
    setLog((prev) => [`🔥 Fight initiated!`, ...prev]);

    let currentUnits = [...units];

    for (let r = 1; r <= 64; r++) {
      setRound(r);
      const roundLog: string[] = [`⚔️ Round ${r}`];

      const sorted = currentUnits.filter(u => u.hp > 0).sort((a, b) => b.speed - a.speed);

      for (const unit of sorted) {
        if (unit.hp <= 0) continue;

        const allies = currentUnits.filter(u => u.side === unit.side && u.hp > 0);
        const enemies = currentUnits.filter(u => u.side !== unit.side && u.hp > 0);

        // 👉 Ability trigger check
        processAbility(unit, r, allies, enemies, roundLog);

        if (enemies.length === 0) continue;

        let candidates = [...enemies];
        const dist = (a: NFT) => Math.abs(unit.position - a.position);

        // Targeting
        if (unit.targetCommand === "Highest HP") {
          candidates.sort((a, b) => b.hp - a.hp);
        } else if (unit.targetCommand === "Lowest HP") {
          candidates.sort((a, b) => a.hp - b.hp);
        } else {
          candidates.sort((a, b) => dist(a) - dist(b));
        }

        const target = candidates[0];
        const range = Math.abs(unit.position - target.position);

        // Damage bonus
        let bonusDamage = 0;
        if (unit.bonusVsTier && target.tier === unit.bonusVsTier.tier) {
          bonusDamage = unit.bonusVsTier.value;
          roundLog.push(`${unit.name} gains +${bonusDamage} vs ${target.tier}-Tier!`);
        }

        // Attack logic
        if (unit.attackStance === "Melee") {
          if (range === 1) {
            const damage = unit.melee + bonusDamage;
            target.hp -= damage;
            roundLog.push(`${unit.name} hits ${target.name} for ${damage} melee damage.`);
          } else {
            if (unit.side === "attacker" && unit.position < 8) unit.position++;
            if (unit.side === "defender" && unit.position > 1) unit.position--;
            roundLog.push(`${unit.name} moved to ${unit.position}.`);
          }
        }

        if (unit.attackStance === "Ranged") {
          if (range === 2) {
            const damage = unit.ranged + bonusDamage;
            target.hp -= damage;
            roundLog.push(`${unit.name} fires at ${target.name} for ${damage} ranged damage.`);
          } else if (range === 1) {
            const fallback = unit.side === "attacker" ? unit.position - 1 : unit.position + 1;
            if (fallback >= 1 && fallback <= 8) {
              unit.position = fallback;
              roundLog.push(`${unit.name} fell back to ${unit.position}.`);
            } else {
              target.hp -= unit.melee;
              roundLog.push(`${unit.name} is cornered and hits ${target.name} for ${unit.melee} melee damage.`);
            }
          } else {
            if (unit.side === "attacker" && unit.position < 8) unit.position++;
            if (unit.side === "defender" && unit.position > 1) unit.position--;
            roundLog.push(`${unit.name} advanced to ${unit.position}.`);
          }
        }

        if (target.hp <= 0) {
          roundLog.push(`💀 ${target.name} was defeated!`);
          processAbility(target, r, [], [], roundLog);
        
        }
      }

      currentUnits = [...currentUnits];
      setUnits(currentUnits);
      setLog((prev) => [...roundLog, ...prev]);

      const attackers = currentUnits.filter(u => u.side === "attacker" && u.hp > 0);
      const defenders = currentUnits.filter(u => u.side === "defender" && u.hp > 0);

      if (attackers.length === 0 || defenders.length === 0) {
        const battleWinner = attackers.length > 0 ? "attacker" : "defender";
        setWinner(battleWinner);
        setBattleEnded(true);
        setLog((prev) => [`🏁 Battle over! ${battleWinner === "attacker" ? "🟢 Attacker Wins!" : "🔴 Defender Wins!"}`, ...prev]);
        break;
      }

      await new Promise((res) => setTimeout(res, 1000));
    }

    setIsFighting(false);
  };
  const renderArmyStats = (side: "attacker" | "defender") => {
    const army = units.filter(u => u.side === side && u.hp > 0);
    const totals = army.reduce(
      (acc, unit) => ({
        hp: acc.hp + unit.hp,
        melee: acc.melee + unit.melee,
        ranged: acc.ranged + unit.ranged,
        speed: acc.speed + unit.speed,
        cost: acc.cost + (unit.cost || 0),
      }),
      { hp: 0, melee: 0, ranged: 0, speed: 0, cost: 0 }
    );
    const power = totals.hp + totals.melee + totals.ranged + totals.speed - totals.cost;

    return (
      <>
        <p><strong className="text-green-400">Moral Bonus:</strong> <span className="text-green-300">+15%</span></p>
        <p><strong>HP:</strong> {totals.hp}</p>
        <p><strong>Melee:</strong> {totals.melee}</p>
        <p><strong>Ranged:</strong> {totals.ranged}</p>
        <p><strong>Speed:</strong> {totals.speed}</p>
        <p><strong>Cost:</strong> {totals.cost}</p>
        <p><strong>Power Rating:</strong> <span className="text-purple-400">{power}</span></p>
        <ul className="mt-3 space-y-1 text-green-400 text-sm">
          {army.map((u) => (
            <li key={u.id}>✅ {u.name} ({u.tier || "?"}-Tier)</li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="py-4 bg-black text-center">
        <nav className="flex justify-center gap-6 text-purple-400 font-semibold">
          <a href="/">🏠 Home</a>
          <a href="/army-builder">🛠 Army Builder</a>
          <a href="/battle">🔁 Restart</a>
        </nav>
      </header>

      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-6">⚔️ Warhamster Battle</h1>

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
                    }`}
                  >
                    <strong>{u.name}</strong>
                    <br />
                    HP: {u.hp}
                  </div>
                ))}
            </div>
          ))}
        </div>

        {!battleStarted && (
          <div className="text-center mb-6">
            <button
              onClick={runBattle}
              className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded text-white font-bold text-xl"
            >
              🧨 FIGHT!
            </button>
          </div>
        )}

        {battleEnded && winner && (
          <div className="text-center text-2xl font-bold my-6 text-yellow-400">
            🏆 {winner === "attacker" ? "Attacker Victory!" : "Defender Victory!"}
            <p className="text-sm text-gray-300 mt-1">Final Round: {round}</p>
          </div>
        )}

        {/* Army Stats + Battle Log */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="bg-gray-800 rounded p-4">
            <h3 className="text-lg font-bold mb-2">🟢 Attacker</h3>
            {renderArmyStats("attacker")}
          </div>

          <div className="bg-gray-900 rounded p-4">
            <h2 className="text-xl font-semibold mb-2">📜 Battle Log</h2>
            <div className="h-64 overflow-y-auto text-sm space-y-1">
              {log.map((entry, idx) => (
              <div key={idx} className="text-gray-300">{entry}
              </div>             
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
