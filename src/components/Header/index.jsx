import { Box, Flex, Text } from "@radix-ui/themes";
import React from "react";
import WalletConnection from "./WalletConnection";

const Header = () => {
  return (
    <Flex
      as="header"
      width="100%"
      align="center"
      justify="between"
      className="bg-primary p-5 h-20 shadow-md"
    >
      <Box>
        <Text
          as="span"
          role="img"
          aria-label="logo"
          className="text-secondary font-extrabold text-3xl tracking-wide"
        >
          MetaVerse Artifacts
        </Text>
      </Box>
      <WalletConnection />
    </Flex>
  );
};

export default Header;
