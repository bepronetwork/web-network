import { NetworkFactory, Web3Connection } from 'bepro-js/dist'

import { NETWORK_FACTORY_ADDRESS, WEB3_CONNECTION } from 'env'

export default class Bepro {
  bepro: Web3Connection
  networkFactory: NetworkFactory

  async init(network = false, erc20 = false, factory = false) {
    this.bepro = new Web3Connection({
      web3Host: WEB3_CONNECTION,
      debug: true
    })

    await this.bepro.start()

    this.networkFactory = new NetworkFactory(
      this.bepro,
      NETWORK_FACTORY_ADDRESS
    )

    if (factory) await this.networkFactory.loadContract()
  }
}
