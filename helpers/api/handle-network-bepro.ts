import { CONTRACT_ADDRESS, WEB3_CONNECTION } from "env";
import { Network, Web3Connection } from "bepro-js";

export default function networkBeproJs({
  web3Connection = WEB3_CONNECTION,
  privateKey = process.env.NEXT_PRIVATE_KEY,
  contractAddress = CONTRACT_ADDRESS,
  debug = false
}: {
  web3Connection?: string;
  privateKey?: string;
  contractAddress?: string;
  debug?: boolean;
}) {
  const bepro = new Web3Connection({
    web3Host: web3Connection,
    privateKey,
    debug
  })

  return new Network(bepro, contractAddress)
}
