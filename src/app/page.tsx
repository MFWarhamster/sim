import Link from "next/link";

export default function Home() {
  return (
    <div className="grid place-items-center mx-auto p-4">
          <div className="grid place-items-center max-w-[700] text-center bg-gray-950 p-1 inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 p-8 rounded-xl shadow-sm shadow-black">
      <h1 className="text-5xl font-black mb-4 text-shadow-lg/30 font-[Open_Sans]">WARHAMSTER 4K</h1>
      <p className="text-lg text-gray-300 mb-6">
        This is a demonstration of the crypto and NFT decentralized application(dApp) that we intend to build. Everything you see here has been built in house to provide a clear picture of our end user product.
      </p>

      <p className="text-gray-400 mb-6">
        Use the options below to Navigate our dApp:
      </p>

<div className="flex flex-col flex justify-center rounded-xl p-1 inset-ring inset-ring-gray-950/5 dark:bg-white/10 dark:inset-ring-white/10 p-4 text-white font-[Open_Sans] min-w-[300] shadow-md shadow-gray-950 bg-gray-950/50">
        <Link href="/player-profile" className="bg-gray-950/50 p-2 inset-ring inset-ring-gray-800 shadow-sm shadow-black rounded-t-xl hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300">PROFILE</Link>
        <Link href="/dex" className="bg-gray-950/50 p-2 inset-ring inset-ring-gray-800 shadow-sm shadow-black hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300">DEX</Link>
        <Link href="/marketplace" className="bg-gray-950/50 p-2 inset-ring inset-ring-gray-800 shadow-sm shadow-black hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300">NFT MARKET</Link>
        <Link href="/army-builder" className="bg-gray-950/50 p-2 inset-ring inset-ring-gray-800 shadow-sm shadow-black hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300">Army Builder</Link>
        <Link href="/battle" className="bg-gray-950/50 p-2 inset-ring inset-ring-gray-800 shadow-sm shadow-black rounded-b-xl hover:shadow-lg hover:shadow-blue-500 hover:bg-blue-300">BATTLE</Link>
      </div>
    </div>
    </div>
  );
}