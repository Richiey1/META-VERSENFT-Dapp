import React, { useState, useEffect } from "react";
import { useAppContext } from "../../contexts/appContext";
import { useAccount, useConfig } from "wagmi";
import NFTCard from "../NFTCard";
import { shortenAddress } from "../../utils/index";
import { getEthersSigner } from "../../config/wallet-connection/adapter";
import { Icon } from "@iconify/react";

const STORAGE_KEY = "nft_transaction_history";

const Account = () => {
  const { userNFTs, tokenMetaData, mintPrice, nextTokenId, transferNFT } =
    useAppContext();
  const { address: userAddress, isConnected } = useAccount();
  const wagmiConfig = useConfig();
  const [recipientMap, setRecipientMap] = useState({});
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (userAddress) {
      const storedTransactions =
        JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      setTransactions(storedTransactions[userAddress] || []);
    }
  }, [userAddress]);

  useEffect(() => {
    if (userAddress) {
      const storedTransactions =
        JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      storedTransactions[userAddress] = transactions;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedTransactions));
    }
  }, [transactions, userAddress]);

  const handleInputChange = (tokenId, value) => {
    setRecipientMap((prev) => ({
      ...prev,
      [tokenId]: value,
    }));
  };

  const handleTransfer = async (tokenId) => {
    const recipient = recipientMap[tokenId];
    if (!recipient) {
      console.error("Please enter a recipient address.");
      return;
    }

    try {
      const signer = await getEthersSigner(wagmiConfig);
      if (!signer) {
        console.error("No signer available. Please connect your wallet.");
        return;
      }

      const metadata = tokenMetaData.get(tokenId);
      const tokenName = metadata?.name || `NFT #${tokenId}`;

      const newTx = {
        id: `tx-${Date.now()}`,
        type: "transfer",
        tokenId: tokenId,
        tokenName: tokenName,
        from: userAddress,
        to: recipient,
        timestamp: new Date().toISOString(),
        status: "pending",
      };

      setTransactions((prev) => [newTx, ...prev]);

      await transferNFT(tokenId, recipient, signer);

      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === newTx.id ? { ...tx, status: "completed" } : tx
        )
      );

      setRecipientMap((prev) => ({
        ...prev,
        [tokenId]: "",
      }));
    } catch (error) {
      console.error("Transfer failed:", error);
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === `tx-${Date.now()}` ? { ...tx, status: "failed" } : tx
        )
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center">Account</h1>
        <p className="text-center text-gray-400">Manage your NFT collection</p>

        {isConnected ? (
          <div className="mt-6">
            <p className="text-gray-300 text-center">
              Connected Wallet: {shortenAddress(userAddress)}
            </p>
            <p className="text-center text-lg font-semibold">
              You own {userNFTs.length} NFT(s)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              {userNFTs.length > 0 ? (
                userNFTs.map((tokenId) => {
                  const metadata = tokenMetaData.get(tokenId);
                  if (!metadata) return null;

                  return (
                    <div
                      key={tokenId}
                      className="border border-gray-700 p-4 rounded-lg bg-gray-800 shadow-lg"
                    >
                      <NFTCard
                        metadata={metadata}
                        mintPrice={mintPrice}
                        tokenId={tokenId}
                        nextTokenId={nextTokenId}
                        mintNFT={() => console.log(`Minting NFT ${tokenId}`)}
                      />
                      <div className="mt-4 flex flex-col gap-3 bg-gray-800 p-4 rounded-lg shadow-md">
                        <input
                          type="text"
                          placeholder="Enter recipient address"
                          value={recipientMap[tokenId] || ""}
                          onChange={(e) =>
                            handleInputChange(tokenId, e.target.value)
                          }
                          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleTransfer(tokenId)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-lg transition-all duration-300 shadow-md active:scale-95"
                        >
                          <Icon icon="mdi:send" width="22" /> Transfer NFT
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="col-span-full text-center text-gray-500">
                  No NFTs found.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-red-400">
            Please connect your wallet.
          </p>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-4">
            Transaction History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-700">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="px-4 py-2">Transaction</th>
                  <th className="px-4 py-2">NFT</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-700">
                      <td className="px-4 py-2">
                        {tx.type === "transfer" ? "Transfer" : tx.type}
                      </td>
                      <td className="px-4 py-2">
                        {tx.tokenName || `#${tx.tokenId}`}
                      </td>
                      <td className="px-4 py-2">{formatDate(tx.timestamp)}</td>
                      <td className="px-4 py-2 text-green-400">{tx.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-2" colSpan="4">
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;
