import { Contract } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import { getReadOnlyProvider } from "../utils";
import NFT_ABI from "../ABI/nft.json";
import { useAccount, useConfig } from "wagmi";
import { getEthersSigner } from "../config/wallet-connection/adapter";

const appContext = createContext();

export const useAppContext = () => {
  const context = useContext(appContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
};

export const AppProvider = ({ children }) => {
  const { address: userAddress, isConnected } = useAccount();
  const [nextTokenId, setNextTokenId] = useState(null);
  const [maxSupply, setMaxSupply] = useState(null);
  const [baseTokenURI, setBaseTokenURI] = useState("");
  const [tokenMetaData, setTokenMetaData] = useState(new Map());
  const [mintPrice, setMintPrice] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const wagmiConfig = useConfig();

  useEffect(() => {
    const contract = new Contract(
      import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      getReadOnlyProvider()
    );
    contract
      .nextTokenId()
      .then((id) => setNextTokenId(id))
      .catch((error) => console.error("error: ", error));

    contract
      .baseTokenURI()
      .then((uri) => setBaseTokenURI(uri))
      .catch((error) => console.error("error: ", error));

    contract
      .maxSupply()
      .then((supply) => setMaxSupply(supply))
      .catch((error) => console.error("error: ", error));

    contract
      .mintPrice()
      .then((price) => setMintPrice(price))
      .catch((error) => console.error("error: ", error));
  }, []);

  useEffect(() => {
    if (!maxSupply || !baseTokenURI) return;

    const tokenIds = [];
    for (let i = 0; i < maxSupply; i++) {
      tokenIds.push(i);
    }

    const promises = tokenIds.map((id) => {
      return fetch(`${baseTokenURI}${id}.json`)
        .then((response) => response.json())
        .then((data) => {
          return data;
        });
    });

    Promise.all(promises)
      .then((responses) => {
        const tokenMetaData = new Map();
        responses.forEach((response, index) => {
          tokenMetaData.set(index, response);
        });
        setTokenMetaData(tokenMetaData);
      })
      .catch((error) => console.error("error: ", error));
  }, [baseTokenURI, maxSupply]);

  useEffect(() => {
    const contract = new Contract(
      import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      getReadOnlyProvider()
    );

    contract
      .nextTokenId()
      .then((id) => setNextTokenId(id))
      .catch((error) => {
        console.log(error);
      });

    const handleMintedNFT = (receiver, nftTokenId) => {
      console.log(`NFT ${nftTokenId} has been minted to ${receiver}`);

      contract
        .nextTokenId()
        .then((id) => setNextTokenId(id))
        .catch((error) => console.error("Error updating nextTokenId:", error));
    };

    contract.on("Minted", handleMintedNFT);

    return () => {
      contract.off("Minted", handleMintedNFT);
    };
  }, []);

  useEffect(() => {
    if (!userAddress || !isConnected || nextTokenId === null) return;
    fetchUserNFTs();
  }, [userAddress, isConnected, nextTokenId]);

  const fetchUserNFTs = async () => {
    try {
      const contract = new Contract(
        import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
        NFT_ABI,
        getReadOnlyProvider()
      );

      const userOwnedNFTs = [];
      for (let i = 0; i < nextTokenId; i++) {
        const owner = await contract.ownerOf(i);
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          userOwnedNFTs.push(i);
        }
      }

      setUserNFTs(userOwnedNFTs);
    } catch (error) {
      console.error("Error fetching user NFTs: ", error);
    }
  };

  const transferNFT = async (tokenId, recipientAddress) => {
    const signer = await getEthersSigner(wagmiConfig);
    if (!recipientAddress) {
      console.error("Recipient address is required.");
      return;
    }
    if (!signer) {
      console.error("Signer not available. Ensure your wallet is connected.");
      return;
    }

    try {
      const contract = new Contract(
        import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
        NFT_ABI,
        signer
      );
      const tx = await contract.safeTransferFrom(
        await signer.getAddress(),
        recipientAddress,
        tokenId
      );
      await tx.wait(); // Wait for confirmation
      console.log(`NFT ${tokenId} transferred to ${recipientAddress}`);

      // Refresh user NFTs after transfer
      fetchUserNFTs();
    } catch (error) {
      console.error("Error transferring NFT:", error);
    }
  };

  return (
    <appContext.Provider
      value={{
        nextTokenId,
        maxSupply,
        baseTokenURI,
        tokenMetaData,
        mintPrice,
        userNFTs,
        transferNFT,
      }}
    >
      {children}
    </appContext.Provider>
  );
};
