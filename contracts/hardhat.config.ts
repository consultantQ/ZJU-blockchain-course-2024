import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x0edf9655c9551732b8c9aa52d742026aa2051c10845adc8894949329cb7b9ce1',
        '0x37f0aac960b71527c82fd06036d16ee6209b72e22cd067b2671cc6647ecd421e',
        '0xef2aae186e9edeb98a3d545bb8366d85e812dc0a5a6c169cf344281c233ef4b8',
        '0x32721d3d683923734368856e979d652a059e2b7740db127334d6aaaf28847b17',
        '0xaaa3f9cb95b6df7fe60e94005162b99a6c2a33d9828b70793cfa0c5a62cbcb52',
        '0x260d4d1319c4d91a9a5bb7e432f2054f35d15ca768b8b2ebac6ac7c92663f31a'
      ]
    },
  },
};

export default config;
