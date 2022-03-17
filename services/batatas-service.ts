import { Web3Connection, Network_v2, ERC20, NetworkFactory } from 'bepro-js'

import {
  CONTRACT_ADDRESS,
  SETTLER_ADDRESS,
  WEB3_CONNECTION,
  NETWORK_FACTORY_ADDRESS
} from '../env'

class Batatas {
  readonly bepro: Web3Connection = new Web3Connection({
    web3Host: WEB3_CONNECTION
  })

  network: Network_v2
  networkFactory: NetworkFactory
  isStarted: boolean = false
  isLoggedIn: boolean = false
}

const BatatasService = new Batatas()

export default BatatasService
