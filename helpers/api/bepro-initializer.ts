import { NetworkFactory, Web3Connection } from "bepro-js";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig()

export default class Bepro {
  bepro: Web3Connection;
  networkFactory: NetworkFactory;

  async init(network = false, erc20 = false, factory = false) {
    this.bepro = new Web3Connection({
      web3Host: publicRuntimeConfig.web3ProviderConnection,
      debug: true
    });

    await this.bepro.start();

    this.networkFactory = new NetworkFactory(this.bepro,
      publicRuntimeConfig.networkConfig.factoryAddress);

    if (factory) await this.networkFactory.loadContract();
  }
}
