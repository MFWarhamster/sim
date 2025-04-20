"use client";
import { useRouter } from "next/navigation";

const BattleSelectionPage = () => {
  const router = useRouter();

  return (
<div className="flex justify-center">
  <div className="flex flex-col flex justify-center rounded-xl p-1 inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 p-4 text-white font-[Open_Sans] min-w-[300] shadow-md shadow-gray-950 bg-gray-950/50">
    <h1 className="text-4xl font-bold mb-4 flex justify-center">BATTLE</h1>
    <button
      onClick={() => router.push('/battle/spar')}
      className="bg-gray-950/50 p-2 inset-ring inset-ring-gray-800 shadow-sm shadow-black rounded-t-xl hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300 hover: cursor-pointer"
    >
      SPAR
    </button>
    <button
      onClick={() => router.push('/battle/conquest')}
      className="bg-gray-950/50 p-2 inset-ring inset-ring-gray-800 shadow-sm shadow-black hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300 hover: cursor-pointer"
    >
      CONQUEST
    </button>
    <button
      className="bg-gray-950/50 p-2 inset-ring inset-ring-gray-800 shadow-sm shadow-black rounded-b-xl hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300"
    >
      SPECTATE
    </button>
  </div>
</div>
    
  );
};

export default BattleSelectionPage;
