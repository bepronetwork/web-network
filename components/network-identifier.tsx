import React, {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import Indicator from '@components/indicator';
import {changeNetwork} from '@reducers/change-network';
import {identifierNeworkLabel} from '@helpers/metamask'

const networkMap = {
  Mainnet: `#29b6af`,
  Ropsten: `#ff4a8d`,
  Kovan: `#9064ff`,
  Rinkeby: `#f6c343`,
  Goerli: `#f6c343`
}

export default function NetworkIdentifier() {
  const {state: {network}, dispatch} = useContext(ApplicationContext);

  function updateNetwork() {
      dispatch(changeNetwork(identifierNeworkLabel(window.ethereum.networkVersion)))
  }
  
  useEffect(updateNetwork, [window.ethereum.networkVersion]);

  return network &&
      <>
        <div className="d-inline-flex align-items-center justify-content-center bg-white py-1 px-2 mr-1 rounded text-uppercase family-bold fs-smallest text-center text-black text-nowrap"> 
          <Indicator bg={networkMap[network]} /> <span>{network} {network !== `ethereum` && `testnet` || `mainnet`}</span>
        </div>
      </> || <></>

}
