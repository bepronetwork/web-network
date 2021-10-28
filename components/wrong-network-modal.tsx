import Modal from '@components/modal';
import React, {useContext, useState} from 'react';
import Image from 'next/image';
import metamaskLogo from '@assets/metamask.png';
import {ApplicationContext} from '@contexts/application';
import {truncateAddress} from '@helpers/truncate-address';
import CheckMarkIcon from '@assets/icons/checkmark-icon';
import ErrorMarkIcon from '@assets/icons/errormark-icon';
import {NETWORKS} from '@helpers/networks'
import Button from './button';



export default function WrongNetworkModal({requiredNetwork = ``, requiredId}) {
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  
  const {state: {currentAddress, network: activeNetwork}} = useContext(ApplicationContext);

  function showModal() {
    return activeNetwork && requiredNetwork && activeNetwork !== requiredNetwork;
  }

  function getColor() {
    if (!activeNetwork || !requiredNetwork)
      return `primary`

    if (activeNetwork === requiredNetwork)
      return `success`

    return `danger`
  }


  function getColumnClass() {
    const color = getColor();

    return `rounded-3 bg-black border border-2 border-${color} text-${color} p-3 d-flex justify-content-between align-items-center w-75`;
  }

  async function handleAddNetwork() {
    setIsAddingNetwork(true);
    const currencyId = `0x${Number(requiredId).toString(16)}`;
    const currencyNetwork = NETWORKS[currencyId]
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: currencyId,
          }
        ]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: currencyId,
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

  const isButtonDisabled = (): boolean => [
    isAddingNetwork 
  ].some(values => values)

  return (
    <Modal
      title="Change network"
      titlePosition="center"
      titleClass="h4 text-white bg-opacity-100"
      show={showModal()}
    >
      <div className="d-flex flex-column text-center align-items-center">
        <strong className="smallCaption d-block text-uppercase text-white-50 mb-3 pb-1">
          please, connect to the  <span className="text-purple"><span>{requiredNetwork}</span> network</span><br/> on your metamask wallet
        </strong>
          <div className="d-flex justify-content-center w-100">
              <div className={getColumnClass()}>
                <div className="d-flex justify-content-start align-items-center">
                  <Image src={metamaskLogo} width={15} height={15} />{" "}
                  <span className="ms-2">
                    {truncateAddress(currentAddress,7,3)}
                  </span>
                </div>
                {!showModal() ? <CheckMarkIcon /> : <ErrorMarkIcon />}
              </div>
        </div>
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
