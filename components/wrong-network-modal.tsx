import Modal from '@components/modal';
import React, {useContext, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {NETWORKS} from '@helpers/networks'
import Button from './button';
import {Spinner} from 'react-bootstrap';
import { useTranslation } from "next-i18next";

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
  const { t } = useTranslation('common')

  const {state: {network: activeNetwork}} = useContext(ApplicationContext);

  function showModal() {
    return !!activeNetwork && !!requiredNetwork && activeNetwork !== requiredNetwork;
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
      title={t('modals.wrong-network.change-network')}
      titlePosition="center"
      titleClass="h4 text-white bg-opacity-100"
      show={showModal()}
    >
      <div className="d-flex flex-column text-center align-items-center">
        <strong className="caption-small d-block text-uppercase text-white-50 mb-3 pb-1">
        {t('modals.wrong-network.please-connect')}  <span style={{color: networkMap[requiredNetwork.toLowerCase()]}}><span>{requiredNetwork}</span> {t('modals.wrong-network.network')}</span><br/> {t('modals.wrong-network.on-your-wallet')}
        </strong>
        {isAddingNetwork && <Spinner className="text-primary align-self-center p-2 mt-1 mb-2" style={{width: `5rem`, height: `5rem`}} animation="border" /> || ``}
        <Button className='my-3' disabled={isButtonDisabled()} onClick={handleAddNetwork}>{t('modals.wrong-network.change-network')}</Button>
        <div className="small-info text-ligth-gray text-center fs-smallest text-dark text-uppercase mt-1 pt-1">
        {t('misc.by-connecting')}{" "}
          <a
            href="https://www.bepro.network/terms-and-conditions"
            target="_blank"
            className="text-decoration-none"
          >
            {t('misc.terms-and-conditions')}
          </a>{" "}
          <br /> {t('misc.and')}{" "}
          <a
            href="https://www.bepro.network/privacy"
            target="_blank"
            className="text-decoration-none"
          >
            {t('misc.privacy-policy')}
          </a>
        </div>
      </div>
    </Modal>
  );
}
