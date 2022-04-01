import { Network, Web3Connection, Network_v2 } from "bepro-js";
import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig()

export default function networkBeproJs({
  web3Connection = publicRuntimeConfig.web3ProviderConnection,
  privateKey = serverRuntimeConfig.walletPrivateKey,
  contractAddress = publicRuntimeConfig.contract.address,
  debug = false
  version = 1
}: {
  web3Connection?: string;
  privateKey?: string;
  contractAddress?: string;
  debug?: boolean;
  version?: number;
}) {
  const bepro = new Web3Connection({
    web3Host: web3Connection,
    privateKey,
    debug
  });

  if (version === 1) return new Network(bepro, contractAddress);

  return new Network_v2(bepro, contractAddress);
}
