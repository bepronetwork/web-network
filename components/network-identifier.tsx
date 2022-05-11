import React, {useContext, useEffect} from 'react';
import {ApplicationContext} from '@contexts/application';
import Indicator from '@components/indicator';
import {NetworkIds} from '@interfaces/enums/network-ids';
import { BeproService } from '@services/bepro-service';
import { changeNetwork } from '@contexts/reducers/change-network';

const networkMap = {
  mainnet: `#29b6af`,
  ethereum: `#29b6af`,
  ropsten: `#ff4a8d`,
  kovan: `#9064ff`,
  rinkeby: `#f6c343`,
  goerli: `#f6c343`
}

export default function NetworkIdentifier() {
  const {state: {currentAddress, network}, dispatch} = useContext(ApplicationContext);

  function updateNetwork() {
    if (!currentAddress)
      return;

    BeproService.bepro.web3.eth.getChainId()
                .then(net => {
                  dispatch(changeNetwork(NetworkIds[net]?.toLowerCase()))
                });
  }

  useEffect(updateNetwork, [currentAddress]);

  return network &&
      <>
        <div className="d-inline-flex align-items-center justify-content-center bg-white py-1 px-2 mr-1 rounded text-uppercase smallCaption fs-smallest text-center text-black text-nowrap">
          <Indicator bg={networkMap[network]} /> <span>{network} {network !== `ethereum` && `testnet` || `mainnet`}</span>
        </div>
      </> || <></>

}
