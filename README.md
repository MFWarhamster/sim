# 🐹 Warhamster 4K dApp (Mock Simulation)

This is a mock Web3 dApp for the **Warhamster 4K** universe — a satirical, crypto-fueled NFT trading card game. This simulation allows users to:

- 🧬 **Blind Mint NFTs** from a collection of 140 randomized Warhamster cards
- 💰 **Simulate token balances** using mock SOL and WAR4K wallets
- 🛒 **Buy NFTs** using a 1-click mint button
- 📦 **View all minted NFTs**
- 💪 **Prepare for Army Builder integration**

> ❗ This is a mock frontend for development and testing — no real wallet or blockchain integration yet.

---

## 🚀 Features

- 🎴 Blind NFT minting at $100 per mint
- 🔄 Wallet balance deduction in SOL or WAR4K
- 🖼 Dynamic image loading per NFT (via metadata ID mapping)
- 💾 Minted NFTs persist in `localStorage`
- 🔍 Fully responsive UI with Tailwind CSS

---

## 🛠 Tech Stack

- **Next.js** 13+ (App Router)
- **React** + **Hooks**
- **Tailwind CSS**
- LocalStorage for state persistence
- Future-ready for Solana + smart contracts

---

## 📦 Project Structure

/app /profile → player profile page (tabs: NFTs, rewards, history) /dex → mock decentralized exchange /marketplace → blind mint page (NFT Minting Station) /army-builder → (coming soon)

public/ /nfts → 140 card images (0-001.jpg → 0-140.jpg)

data/ warhamster_nfts_with_power_abilities_final.json

🧠 Coming Soon
✅ Only allow minted NFTs in Army Builder

✅ Conquest Mode and Battle Flow

🧠 Staking + rewards mechanics

🧠 Wallet connection

🧠 Solana minting integration
