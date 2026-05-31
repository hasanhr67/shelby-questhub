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
  const [walletInstance, setWalletInstance] = useState<any>(null);

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

  // ব্রাউজার লোড হওয়ার পর Petra/Aptos ওয়ালেট খুঁজে বের করার ইফেক্ট লুপ
  useEffect(() => {
    const detectWallet = () => {
      const win = typeof window !== "undefined" ? (window as any) : null;
      if (win) {
        const provider = win.aptos || win.petra || (win.AptosWallet ? win.AptosWallet : null);
        if (provider) {
          setWalletInstance(provider);
        }
      }
    };

    detectWallet();
    // যদি এক্সটেনশন লোড হতে দেরি হয়, তার জন্য একটা ব্যাকআপ ইভেন্ট লিসেনার
    window.addEventListener("load", detectWallet);
    return () => window.removeEventListener("load", detectWallet);
  }, []);

  // ওয়ালেট কানেক্ট করার ফাংশন
  const connectWallet = async () => {
    try {
      // যদি স্টেট-এ ইনস্ট্যান্স না থাকে, সরাসরি উইন্ডো থেকে আবার ট্রাই করবে
      const win = typeof window !== "undefined" ? (window as any) : null;
      const currentWallet = walletInstance || win?.aptos || win?.petra;

      if (!currentWallet) {
        alert("Petra Wallet Extension পাওয়া যায়নি! দয়া করে নিশ্চিত করুন আপনার ব্রাউজারে Petra ইন্সটলড আছে।");
        return;
      }

      // কানেক্ট রিকোয়েস্ট
      const account = await currentWallet.connect();
      // এড্রেস এক্সট্রাক্ট করা (অবজেক্ট বা স্ট্রিং ফরম্যাট হ্যান্ডেল করতে)
      const address = account?.address || account;

      if (address && typeof address === "string") {
        setAccountAddress(address);
        setWalletConnected(true);
      } else {
        // অল্টারনেটিভ ডিরেক্ট অ্যাকাউন্ট মেথড কল
        const activeAccount = await currentWallet.account();
        if (activeAccount?.address) {
          setAccountAddress(activeAccount.address);
          setWalletConnected(true);
        }
      }
    } catch (err) {
      console.error("Connection Error: ", err);
      alert("Petra Wallet কানেক্ট করা যায়নি। দয়া করে আপনার ওয়ালেট এক্সটেনশনটি আনলক (Password দিন) করে আবার চেষ্টা করুন।");
    }
  };

  // Shelbynet-এ কাস্টম ট্রানজেকশন ইন্টারঅ্যাকশন
  const toggleQuest = async (index: number) => {
    try {
      const win = typeof window !== "undefined" ? (window as any) : null;
      const currentWallet = walletInstance || win?.aptos || win?.petra;

      if (!currentWallet) {
        alert("Wallet structure missing!");
        return;
      }

      const transactionPayload = {
        type: "entry_function_payload",
        function: "0x1::aptos_account::transfer",
        type_arguments: [],
        arguments: [accountAddress || "0x1", "0"], 
      };

      const pendingTx = await currentWallet.signAndSubmitTransaction(transactionPayload);
      const txHash = pendingTx?.hash || pendingTx;

      const updated = [...completed];
      updated[index] = true;
      setCompleted(updated);

      alert(`Quest Completed Successfully! 🎉\n\nTask: ${quests[index]}\n\nNetwork: Shelbynet\nTX Hash: ${txHash}`);

    } catch (err) {
      console.error("Tx Error: ", err);
      alert("ট্রানজেকশন ক্যানসেল করা হয়েছে বা Shelbynet-এ ফেইল হয়েছে।");
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

        {/* Network & Progress Summary */}
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

        {/* Quests Container */}
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

        {/* Reward Area */}
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