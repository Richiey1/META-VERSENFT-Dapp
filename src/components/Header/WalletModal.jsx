import { Icon } from "@iconify/react";
import { Dialog, Flex, Text } from "@radix-ui/themes";
import React, { useState } from "react";
import { useConnectors } from "wagmi";

const WalletModal = () => {
  const connectors = useConnectors();
  const [pendingConnectorUID, setPendingConnectorUID] = useState(null);
  const [error, setError] = useState("");

  const connectWallet = async (connector) => {
    try {
      setError("");
      setPendingConnectorUID(connector.id);
      await connector.connect();
    } catch (err) {
      console.error("Connection error:", err);
      setError("Failed to connect. Please try again.");
    } finally {
      setPendingConnectorUID(null);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all hover:scale-105 hover:from-blue-600 hover:to-purple-800">
          <Icon icon="mdi:wallet" className="w-5 h-5" />
          Connect Wallet
        </button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="480px" className="bg-secondary p-6 rounded-xl shadow-lg">
        <Dialog.Title className="text-primary text-xl font-bold text-center mb-4">
          Choose a Wallet
        </Dialog.Title>

        {error && (
          <div className="flex items-center gap-2 p-3 text-red-600 bg-red-100 rounded-md text-sm">
            <Icon icon="mdi:alert-circle" className="w-5 h-5" />
            {error}
          </div>
        )}

        <Flex direction="column" gap="4">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connectWallet(connector)}
              disabled={pendingConnectorUID === connector.id}
              className={`flex items-center justify-between w-full p-4 rounded-lg border border-primary text-primary bg-gradient-to-b from-primary/10 to-primary/5 hover:bg-primary/20 transition-all ${
                pendingConnectorUID === connector.id ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={connector.icon} alt={`${connector.name} logo`} className="w-8 h-8 rounded-md" />
                <Text className="font-medium">{connector.name}</Text>
              </div>

              {pendingConnectorUID === connector.id ? (
                <Icon icon="eos-icons:loading" className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <Icon icon="mdi:chevron-right" className="w-5 h-5 text-primary" />
              )}
            </button>
          ))}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default WalletModal;
