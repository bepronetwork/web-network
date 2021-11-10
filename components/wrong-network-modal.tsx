import Modal from '@components/modal';
import React, {useContext, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {NETWORKS} from '@helpers/networks'
import Button from './button';
import {Spinner} from 'react-bootstrap';

const networkMap = {
  mainnet: `#29b6af`,
  ethereum: `#29b6af`,
  ropsten: `#ff4a8d`,
  kovan: `#9064ff`,
  rinkeby: `#f6c343`,
  goerli: `#f6c343`,
  moonriver: `#f6c343`,
}

export default function WrongNetworkModal({requiredNetwork = ``}) {
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);

  const {state: {network: activeNetwork}} = useContext(ApplicationContext);

  function showModal() {
    console.log(`activeNetwork`, activeNetwork, requiredNetwork)
    return activeNetwork && requiredNetwork && activeNetwork !== requiredNetwork;
  }

  function getColor() {
    if (!activeNetwork || !requiredNetwork)
      return `primary`

    if (activeNetwork === requiredNetwork)
      return `success`

    return `danger`
  }

  async function handleAddNetwork() {
    setIsAddingNetwork(true);
    const chainId = `0x${Number(process.env.NEXT_PUBLIC_NEEDS_CHAIN_ID).toString(16)}`;
    const currencyNetwork = NETWORKS[chainId]
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: chainId,
          }
        ]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainId,
              chainName: currencyNetwork.name,
              nativeCurrency: {
                name: currencyNetwork.currency.name,
                symbol: currencyNetwork.currency.symbol,
                decimals: currencyNetwork.decimals,
              },
              rpcUrls: currencyNetwork.rpcUrls,
              blockExplorerUrls: [currencyNetwork.explorerURL]
            }
          ]
        });
      }
    }finally{
      setIsAddingNetwork(false);
    }
  }

  const isButtonDisabled = (): boolean => [isAddingNetwork].some(values => values)

  return (
    <Modal
      title="Change network"
      titlePosition="center"
      titleClass="h4 text-white bg-opacity-100"
      show={showModal()}
    >
      <div className="d-flex flex-column text-center align-items-center">
        <strong className="smallCaption d-block text-uppercase text-white-50 mb-3 pb-1">
          please, connect to the  <span style={{color: networkMap[requiredNetwork.toLowerCase()]}}><span>{requiredNetwork}</span> network</span><br/> on your metamask wallet
        </strong>
        {isAddingNetwork && <Spinner className="text-blue align-self-center p-2 mt-1 mb-2" style={{width: `5rem`, height: `5rem`}} animation="border" /> || ``}
        <Button className='my-3' disabled={isButtonDisabled()} onClick={handleAddNetwork}>Change network</Button>
        <div className="smallInfo text-ligth-gray text-center fs-smallest text-dark text-uppercase mt-1 pt-1">
        by connecting, you accept{" "}
          <a
            href="https://www.bepro.network/terms-and-conditions"
            target="_blank"
            className="text-decoration-none"
          >
            Terms & Conditions
          </a>{" "}
          <br /> and{" "}
          <a
            href="https://www.bepro.network/private-policy"
            target="_blank"
            className="text-decoration-none"
          >
            PRIVACY POLICY
          </a>
        </div>
      </div>
    </Modal>
  );
}
