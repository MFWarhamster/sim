"use client";
import { useRouter } from "next/navigation";

const BattleSelectionPage = () => {
  const router = useRouter();

  return (
    <div className="p-6 text-white">
      <h1 className="text-4xl font-bold mb-4">Battle Simulator</h1>
      <button
        onClick={() => router.push('/battle/spar')}
        className="px-8 text-2xl py-1 bg-red-600 border border-red-400 shadow-lg shadow-red-900 rounded mr-8 hover: cursor-pointer"
      >
        SPAR
      </button>
      <button
        onClick={() => router.push('/battle/conquest')}
        className="px-8 text-2xl text-strong py-1 bg-green-600 border border-green-400 shadow-lg shadow-green-900 rounded mr-8 cursor-pointer"
      >
        Conquest
      </button>
    </div>
  );
};

export default BattleSelectionPage;
