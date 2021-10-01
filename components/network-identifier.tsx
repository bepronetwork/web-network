import React, {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {BeproService} from '@services/bepro-service';
import Indicator from '@components/indicator';
import {changeNetwork} from '@reducers/change-network';
import WrongNetworkModal from '@components/wrong-network-modal';

const networkMap = {
  ethereum: `#29b6af`,
  roptsen: `#ff4a8d`,
  kovan: `#9064ff`,
  rinkeby: `#f6c343`,
  goerly: `#f6c343`
}

export default function NetworkIdentifier() {
  const {state: {currentAddress, network}, dispatch} = useContext(ApplicationContext);

  function updateNetwork() {
    if (!currentAddress)
      return;

    BeproService.bepro.web3.eth.net.getNetworkType()
                .then(net => {
                  dispatch(changeNetwork(net));
                });
  }

  useEffect(updateNetwork, [currentAddress]);

  return network &&
      <>
        <div className="d-inline-flex align-items-center justify-content-center bg-white py-1 px-2 mr-1 rounded text-uppercase family-bold fs-smallest text-center text-black text-nowrap"> 
          <Indicator bg={networkMap[network]} /> <span>{network} {network !== `ethereum` && `testnet` || `mainnet`}</span>
        </div>
        <WrongNetworkModal requiredNetwork="kovan" />
      </> || <></>

}
