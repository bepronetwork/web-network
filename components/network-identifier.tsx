import React, {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {BeproService} from '@services/bepro-service';
import Indicator from '@components/indicator';
import {changeNetwork} from '@reducers/change-network';

const networkMap = {
  ethereum: `#29b6af`,
  roptsen: `#ff4a8d`,
  kovan: `#9064ff`,
  rinkeby: `#f6c343`,
  goerly: `#f6c343`
}

export default function NetworkIdentifier() {
  const {state: {currentAddress}, dispatch} = useContext(ApplicationContext);
  const [network, setNetwork] = useState(``);

  function updateNetwork() {
    if (!currentAddress)
      return;

    BeproService.bepro.web3.eth.net.getNetworkType()
                .then(network => {
                  setNetwork(network)
                  dispatch(changeNetwork(network));
                });
  }

  useEffect(updateNetwork, [currentAddress]);

  return <>{network && <button className="btn btn-md btn-trans text-uppercase mr-1"> <Indicator bg={networkMap[network]} /> {network} {network !== `ethereum` && `testnet` || `mainnet`}</button> || ``}</>
}
