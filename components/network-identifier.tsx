import React, {useContext, useEffect} from 'react';
import {ApplicationContext} from '@contexts/application';
import Indicator from '@components/indicator';
import {NetworkIds} from '@interfaces/enums/network-ids';
import { BeproService } from '@services/bepro-service';
import { changeNetwork } from '@contexts/reducers/change-network';
import Button from './button';

const networkMap = {
  mainnet: `#29b6af`,
  ethereum: `#29b6af`,
  ropsten: `#ff4a8d`,
  kovan: `#9064ff`,
  rinkeby: `#f6c343`,
  goerli: `#f6c343`,
  moonriver: `#f6c343`,
}

export default function NetworkIdentifier() {
  const {state: {currentAddress, network}, dispatch} = useContext(ApplicationContext);

  function updateNetwork() {
    if (!currentAddress)
      return;

    const chainId = (window as any)?.ethereum?.chainId;
    dispatch(changeNetwork((NetworkIds[+chainId] || `unknown`)?.toLowerCase()))

  }

  useEffect(updateNetwork, [currentAddress]);

  return network &&
      <>
        <Button className='px-3 py-2 rounded pe-none bg-white bg-opacity-10'>
          <Indicator bg={networkMap[network]} /> <span>{network} {network !== process.env.NEXT_PUBLIC_NEEDS_CHAIN_NAME && `testnet` || ``}</span>
        </Button>
      </> || <></>

}
