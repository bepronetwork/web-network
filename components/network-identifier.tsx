import React, {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import Indicator from '@components/indicator';
import { NetworkChain } from "@interfaces/enums/network-chain";
import WrongNetworkModal from '@components/wrong-network-modal';
import { CURRENT_NETWORK_CHAINID } from "../env";
const networkMap = {
  Mainnet: `#29b6af`,
  Ropsten: `#ff4a8d`,
  Kovan: `#9064ff`,
  Rinkeby: `#f6c343`,
  Goerli: `#f6c343`
}

export default function NetworkIdentifier() {
  const {state: {network}} = useContext(ApplicationContext);

  return network &&
      <>
        <div className="d-inline-flex align-items-center justify-content-center bg-white py-1 px-2 mr-1 rounded text-uppercase family-bold fs-smallest text-center text-black text-nowrap"> 
          <Indicator bg={networkMap[NetworkChain[network]]} /> <span>{NetworkChain[network]} {(NetworkChain[network] !== 'Mainnet' && NetworkChain[network] !== 'Moonbeam') && `testnet`}</span>
        </div>
        <WrongNetworkModal requiredNetwork={CURRENT_NETWORK_CHAINID} />
      </> || <></>

}
