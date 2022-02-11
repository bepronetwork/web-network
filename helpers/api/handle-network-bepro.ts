import { CONTRACT_ADDRESS, WEB3_CONNECTION } from "env";
import { Network } from "bepro-js/dist";

export default function networkBeproJs({
  test = true,
  web3Connection = WEB3_CONNECTION,
  privateKey = process.env.NEXT_PRIVATE_KEY,
  contractAddress = CONTRACT_ADDRESS,
}: {
  test: boolean;
  web3Connection?: string;
  privateKey?: string;
  contractAddress?: string;
}) {
  const opt = {
    opt: {
      web3Connection,
      privateKey,
    },
    test,
  };

  return new Network({
    contractAddress: contractAddress,
    ...opt,
  });
}
