import { NetworkFactoryV2, Web3Connection } from "@taikai/dappkit";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig()

export default class Bepro {
  bepro: Web3Connection;
  networkFactory: NetworkFactoryV2;

  async init(network = false, erc20 = false, factory = false) {
    console.log(network, erc20)
    this.bepro = new Web3Connection({
      web3Host: publicRuntimeConfig.web3ProviderConnection,
      debug: true
    });

    await this.bepro.start();

    this.networkFactory = new NetworkFactoryV2(this.bepro,
      publicRuntimeConfig.networkConfig.factoryAddress);

    if (factory) await this.networkFactory.loadContract();
  }
}
