import { Icon } from "@iconify/react/dist/iconify.js";
import { formatEther } from "ethers";
import React, { useState } from "react";
import { truncateString } from "../../utils";

const NFTCard = ({ metadata, mintPrice, tokenId, nextTokenId, mintNFT }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleMint = async () => {
    setIsLoading(true);
    try {
      await mintNFT(tokenId);
      // Success notification will be handled by global notifications
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-800 via-violet-900 to-purple-800 p-1 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-lg bg-black p-5">
        {metadata.image && (
          <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-4">
            <img 
              src={metadata.image} 
              alt={metadata.name} 
              className="h-full w-full object-cover transition-transform duration-700 ease-in-out hover:scale-110"
            />
            {metadata.animation_url && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-70">
                <button 
                  className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(metadata.animation_url, '_blank');
                  }}
                >
                  <Icon icon="mdi:play" width="16" />
                  <span>View 3D/Animation</span>
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white">{metadata.name}</h3>
            <p className="mt-1 text-sm text-gray-300">{truncateString(metadata.description, 100)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-gray-800 p-2 text-center">
              <p className="text-xs text-gray-400">Attributes</p>
              <p className="text-lg font-semibold text-white flex items-center justify-center">
                <Icon icon="mdi:card-bulleted-outline" className="mr-1" />
                {metadata.attributes.length}
              </p>
            </div>
            <div className="rounded-lg bg-gray-800 p-2 text-center">
              <p className="text-xs text-gray-400">Price</p>
              <p className="text-lg font-semibold text-white flex items-center justify-center">
                <Icon icon="mdi:ethereum" className="mr-1" />
                {`${formatEther(mintPrice)}`}
              </p>
            </div>
          </div>
          
          {isHovered && metadata.attributes.length > 0 && (
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-90 p-4 transition-opacity duration-300">
              <h4 className="text-white font-semibold mb-2">NFT Attributes</h4>
              <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[200px] w-full">
                {metadata.attributes.map((attr, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-2 text-center">
                    <p className="text-xs text-purple-400">{attr.trait_type}</p>
                    <p className="text-sm font-medium text-white">{attr.value}</p>
                  </div>
                ))}
              </div>
              <button 
                className="mt-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHovered(false);
                }}
              >
                Close Details
              </button>
            </div>
          )}
          
          <button
            onClick={Number(nextTokenId) <= tokenId ? handleMint : null}
            disabled={Number(nextTokenId) > tokenId || isLoading}
            className={`w-full rounded-lg py-3 font-semibold ${
              Number(nextTokenId) <= tokenId 
                ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600"
                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            } transition-all duration-300 transform hover:scale-[1.03] flex items-center justify-center`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Icon icon="eos-icons:loading" width="24" className="mr-2 animate-spin" />
                Minting...
              </span>
            ) : (
              <span className="flex items-center">
                {Number(nextTokenId) <= tokenId ? (
                  <>
                    <Icon icon="mdi:shopping" width="20" className="mr-2" />
                    Mint NFT
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:check-circle" width="20" className="mr-2" />
                    Owned
                  </>
                )}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;