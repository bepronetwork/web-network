import { NetworkFactory, Web3Connection } from "bepro-js";
import { WEB3_CONNECTION } from "env";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig()

export default class Bepro {
  bepro: Web3Connection;
  networkFactory: NetworkFactory;

  async init(network = false, erc20 = false, factory = false) {
    this.bepro = new Web3Connection({
      web3Host: WEB3_CONNECTION,
      debug: true
    });

    await this.bepro.start();

    this.networkFactory = new NetworkFactory(this.bepro,
      publicRuntimeConfig.networkConfig.factoryAddress);

    if (factory) await this.networkFactory.loadContract();
  }
}
