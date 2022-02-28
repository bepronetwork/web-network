import { CONTRACT_ADDRESS, WEB3_CONNECTION } from "env";
import { Network, Web3Connection } from "bepro-js";

export default function networkBeproJs({
  test = true,
  web3Connection = WEB3_CONNECTION,
  privateKey = process.env.NEXT_PRIVATE_KEY,
  contractAddress = CONTRACT_ADDRESS,
  debug = false
}: {
  test: boolean;
  web3Connection?: string;
  privateKey?: string;
  contractAddress?: string;
  debug?: boolean;
}) {
  const opt = {
    opt: {
      web3Connection,
      privateKey,
    },
    test,
  };

  const bepro = new Web3Connection({
    web3Host: web3Connection,
    privateKey,
    debug
  })

  return new Network(bepro, contractAddress)
}
