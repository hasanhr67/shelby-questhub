"use client";

import { useState, useEffect } from "react";

const SHELBYNET_CONFIG = {
  fullnode: "https://api.shelbynet.shelby.xyz/v1",
  shelbyRpc: "https://api.shelbynet.shelby.xyz/shelby",
  nodeUri: "https://api.shelbynet.shelby.xyz/v1"
};

export default function Home() {
  const [completed, setCompleted] = useState([
    false, false, false, false, false, false, false
  ]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState("");
  const [provider, setProvider] = useState<any>(null);

  const quests = [
    "Say GM to Shelby Protocol", 
    "Say GN to Shelby Protocol", 
    "Initialize Shelby Blob Storage", 
    "Upload Test Blob via RPC", 
    "Deploy Move Contract Token", 
    "Mint Shelby Testnet NFT", 
    "Join Shelby Discord & Ecosystem"
  ];

  const done = completed.filter(Boolean).length;
  const progress = (done / quests.length) * 100;

  // Petra / Aptos অফিশিয়াল ইভেন্ট লিসেনার লজিক (Deep Research Fix)
  useEffect(() => {
    const handleInitialized = () => {
      if ("aptos" in window) {
        setProvider((window as any).aptos);
      } else if ("petra" in window) {
        setProvider((window as any).petra);
      }
    };

    // যদি Petra অলরেডি ব্রাউজারে ইনজেক্টেড থাকে
    if ("aptos" in window || "petra" in window) {
      handleInitialized();
    }

    // Petra-র নিজস্ব অফিশিয়াল ইনজেকশন লিসেনার ইভেন্ট
    window.addEventListener("aptos#initialized", handleInitialized);
    
    return () => {
      window.removeEventListener("aptos#initialized", handleInitialized);
    };
  }, []);

  // ওয়ালেট কানেক্ট করার মাস্টার ফাংশন
  const connectWallet = async () => {
    try {
      // ফ্যালব্যাক রান যদি কোনো কারণে স্টেট আপডেট হতে দেরি হয়
      const activeProvider = provider || (typeof window !== "undefined" ? (window as any).aptos : null);

      if (!activeProvider) {
        alert("Petra Wallet খুঁজে পাওয়া যায়নি! দয়া করে আপনার ব্রাউজারে Petra Wallet এক্সটেনশনটি চেক করুন এবং এটি আনলক করুন।");
        return;
      }

      // Petra অফিশিয়াল হ্যান্ডশেক এবং কানেকশন রিকোয়েস্ট
      const connectionResponse = await activeProvider.connect();
      
      // বিভিন্ন Petra ভার্সনের ডেটা স্ট্রাকচার হ্যান্ডেল করা
      const address = connectionResponse?.address || connectionResponse;

      if (address && typeof address === "string") {
        setAccountAddress(address);
        setWalletConnected(true);
      } else {
        // ওল্ড জেনারেশন মেথড কল ব্যাকআপ
        const accountData = await activeProvider.account();
        if (accountData?.address) {
          setAccountAddress(accountData.address);
          setWalletConnected(true);
        }
      }
    } catch (err: any) {
      console.error("Deep Connection Error:", err);
      alert("Failed to connect wallet: " + (err?.message || "User rejected or wallet is locked."));
    }
  };

  // Shelbynet ট্রানজেকশন ইন্টারঅ্যাকশন
  const toggleQuest = async (index: number) => {
    try {
      const activeProvider = provider || (typeof window !== "undefined" ? (window as any).aptos : null);
      if (!activeProvider) {
        alert("Wallet provider missing!");
        return;
      }

      // Aptos L1 স্ট্যান্ডার্ড জিরো-ভ্যালু কোর ট্রান্সফার পেলোড
      const payload = {
        type: "entry_function_payload",
        function: "0x1::aptos_account::transfer",
        type_arguments: [],
        arguments: [accountAddress || "0x1", "0"], 
      };

      const pendingTx = await activeProvider.signAndSubmitTransaction(payload);
      const txHash = pendingTx?.hash || pendingTx;

      const updated = [...completed];
      updated[index] = true;
      setCompleted(updated);

      alert(`Quest Completed Successfully! 🎉\n\nTask: ${quests[index]}\n\nTX Hash: ${txHash}`);
    } catch (err) {
      console.error("Tx Error: ", err);
      alert("ট্রানজেকশন সাবমিট করা যায়নি বা ক্যানসেল হয়েছে।");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              Shelby QuestHub
            </h1>
            <p className="mt-2 text-zinc-400 text-sm md:text-base">
              Aptos L1 Powered Decentralized Blob Storage Engagement Platform [Shelbynet]
            </p>
          </div>
          
          <button 
            onClick={connectWallet}
            className={`mt-4 md:mt-0 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              walletConnected 
                ? "bg-purple-950/40 text-purple-400 border-purple-500/30" 
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 border-transparent shadow-lg shadow-purple-600/20"
            }`}
          >
            {walletConnected ? `Connected: ${accountAddress.slice(0,6)}...${accountAddress.slice(-4)}` : "Connect Petra Wallet"}
          </button>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="md:col-span-2 border border-zinc-800 p-6 rounded-2xl bg-zinc-900/40 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-zinc-200">Quest Progress</h2>
            <p className="mt-1 text-sm text-zinc-400">{done} of {quests.length} Completed</p>
            <div className="w-full bg-zinc-800 rounded-full h-3.5 mt-4 overflow-hidden border border-zinc-700/50">
              <div 
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-3.5 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>

          <div className="border border-zinc-800 p-6 rounded-2xl bg-zinc-900/20 text-xs space-y-2.5">
            <h3 className="font-bold text-zinc-400 uppercase tracking-wider mb-1">Shelbynet Status</h3>
            <div><span className="text-zinc-500">Aptos Node:</span> <code className="text-pink-400 block truncate">{SHELBYNET_CONFIG.fullnode}</code></div>
            <div><span className="text-zinc-500">Shelby RPC:</span> <code className="text-purple-400 block truncate">{SHELBYNET_CONFIG.shelbyRpc}</code></div>
          </div>
        </div>

        {/* Quests List */}
        <div className="mt-8 space-y-3">
          {quests.map((q, index) => (
            <div 
              key={index} 
              className="border border-zinc-800/80 rounded-xl p-4 flex justify-between items-center bg-zinc-900/20 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-zinc-600 font-mono text-sm group-hover:text-purple-400 transition-colors">0{index + 1}</span>
                <span className="text-zinc-200 font-medium md:text-lg">{q}</span>
              </div>
              <button
                disabled={!walletConnected || completed[index]}
                onClick={() => toggleQuest(index)}
                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                  completed[index] 
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 cursor-default" 
                    : !walletConnected
                    ? "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
                }`}
              >
                {completed[index] ? "Done ✅" : "Complete"}
              </button>
            </div>
          ))}
        </div>

        {/* Reward Section */}
        <div className="mt-8 border border-zinc-800 p-6 rounded-2xl bg-gradient-to-b from-zinc-900/50 to-purple-950/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl font-bold text-zinc-100">Reward Hub 🎁</h2>
          <p className="text-zinc-400 text-sm mt-1">Verify all decentralized operations on Shelbynet to claim your Developer NFT.</p>
          <button
            disabled={done !== quests.length}
            className={`mt-5 px-6 py-3 rounded-xl font-extrabold text-base transition-all ${
              done === quests.length 
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 hover:opacity-95" 
                : "bg-zinc-800/80 text-zinc-600 border border-zinc-700/50 cursor-not-allowed"
            }`}
          >
            {done === quests.length ? "Claim Shelby Developer NFT 🚀" : `Unlock after ${quests.length - done} more tasks`}
          </button>
        </div>

      </div>
    </main>
  );
}