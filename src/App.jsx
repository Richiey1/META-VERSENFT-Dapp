import { useState, useMemo } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useAppContext } from "./contexts/appContext";
import NFTCard from "./components/NFTCard";
import useMintToken from "./hooks/useMintToken";

function App() {
  const {
    nextTokenId,
    tokenMetaData,
    mintPrice,
    isConnected,
    userAddress,
    userBalance,
    userNFTs,
  } = useAppContext();
  const [activeTab, setActiveTab] = useState("mint");

  console.log("nextTokenId:", nextTokenId);

  const tokenMetaDataArray = useMemo(() => Array.from(tokenMetaData.values()), [tokenMetaData]);
  const mintToken = useMintToken();

  // Format user wallet address
  const formattedAddress = userAddress
    ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">

      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-128px)]">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-violet-900 to-purple-800 p-1">
            <div className="bg-black/80 backdrop-blur-sm p-12 rounded-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
              MetaVerse Artifacts
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Mint and manage your NFTs on the most advanced decentralized platform.
              </p>

              {isConnected && (
                <div className="flex flex-wrap justify-center gap-4">
                  <InfoBox label="Wallet" value={formattedAddress} />
                  {userBalance && <InfoBox label="Balance" value={`${userBalance} ETH`} />}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {["mint", "manage", "marketplace"].map((tab) => (
            <TabButton key={tab} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} />
          ))}
        </div>

        {/* NFT Display Section */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {activeTab === "mint" && tokenMetaDataArray.map((token, i) => (
            <NFTCard
              key={token.name.replace(/\s/g, "")}
              metadata={token}
              mintPrice={mintPrice}
              tokenId={i + 1}
              nextTokenId={nextTokenId}
              mintNFT={mintToken}
              isOwned={userNFTs?.includes(i + 1)}
            />
          ))}

          {activeTab === "manage" && tokenMetaDataArray
            .filter((_, i) => userNFTs?.includes(i + 1))
            .map((token, i) => (
              <NFTCard
                key={token.name.replace(/\s/g, "")}
                metadata={token}
                mintPrice={mintPrice}
                tokenId={userNFTs[i]}
                nextTokenId={nextTokenId}
                mintNFT={mintToken}
                isOwned={true}
              />
            ))}
        </div>

        {activeTab === "marketplace" && (
          <ComingSoon message="Our marketplace is under development. Soon you'll be able to buy and sell NFTs with other collectors." />
        )}
      </main>

      <Footer />
    </div>
  );
}

/* Reusable Components */
const InfoBox = ({ label, value }) => (
  <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
    <div className="text-left">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

const TabButton = ({ tab, activeTab, setActiveTab }) => {
  const tabNames = {
    mint: "Mint NFT",
    manage: "Manage NFTs",
    marketplace: "Marketplace",
  };

  const tabDescriptions = {
    mint: "Mint your NFT and make it available for sale",
    manage: "View and manage your minted NFTs",
    marketplace: "Buy and sell NFTs on the marketplace",
  };

  return (
    <div
      className={`border-l-2 ${
        activeTab === tab ? "border-purple-500" : "border-gray-700"
      } p-4 cursor-pointer`}
      onClick={() => setActiveTab(tab)}
    >
      <h1 className="text-xl font-bold">{tabNames[tab]}</h1>
      <p className="text-gray-500">{tabDescriptions[tab]}</p>
    </div>
  );
};

const ComingSoon = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-64">
    <h2 className="text-2xl font-bold mb-4">Marketplace Coming Soon</h2>
    <p className="text-gray-400 text-center max-w-md">{message}</p>
  </div>
);

export default App;
