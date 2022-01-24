import {BeproService} from '@services/bepro-service';
import React, {useContext, useEffect, useState,} from 'react';
import {ApplicationContext} from '@contexts/application';
import {changeWalletState} from '@reducers/change-wallet-connect';
import {changeCurrentAddress} from '@reducers/change-current-address';
import Modal from '@components/modal';
import Image from 'next/image';
import metamaskLogo from '@assets/metamask.png';
import { changeNetwork } from '@contexts/reducers/change-network';
import { NetworkIds } from '@interfaces/enums/network-ids';
import Button from './button';
import { NETWORKS } from '@helpers/networks';
import { useTranslation } from 'next-i18next';

const REQUIRED_NETWORK = process.env.NEXT_PUBLIC_NEEDS_CHAIN_NAME;
const networkMap = {
  mainnet: `#29b6af`,
  ethereum: `#29b6af`,
  ropsten: `#ff4a8d`,
  kovan: `#9064ff`,
  rinkeby: `#f6c343`,
  goerli: `#f6c343`,
  moonriver: `#f6c343`,
}

export default function ConnectWalletButton({children = null, forceLogin = false, onSuccess = () => null, onFail = () => console.error("Failed to login"), asModal = false, btnColor = `white`}) {
  const { state: {metaMaskWallet, beproInit, currentAddress, network: activeNetwork}, dispatch } = useContext(ApplicationContext);
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const { t } = useTranslation(['common', 'connect-wallet-button'])

  async function connectWallet() {
    let loggedIn = false;

    try {
      const chainId = (window as any)?.ethereum?.chainId;
      if (+process.env.NEXT_PUBLIC_NEEDS_CHAIN_ID !== +chainId) {
        dispatch(changeNetwork((NetworkIds[+chainId] || `unknown`)?.toLowerCase()))
        return;
      } else {
         await BeproService.login();
         loggedIn = BeproService.isLoggedIn
      }
    } catch (e) {
      console.error(`Failed to login on BeproService`, e);
    }

    if (!loggedIn)
      onFail()
    else onSuccess();

    dispatch(changeWalletState(loggedIn))
    dispatch(changeCurrentAddress(BeproService.address));
  }

  useEffect(() => {
    if (!beproInit)
      return;


    if (forceLogin)
      BeproService.login()
      .then(() => {
        dispatch(changeWalletState(BeproService.isLoggedIn))
      })
      .catch(e => {
        console.error(`Error changing wallet state`, e);
      })

  }, [beproInit]);

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

  function isButtonDisabled() {
    return [
      isAddingNetwork,
      activeNetwork === process.env.NEXT_PUBLIC_NEEDS_CHAIN_NAME
    ].some(values => values)
  }

  if (asModal)
    return (
      <Modal
      title={t('connect-wallet-button:title')}
      titlePosition="center"
      centerTitle
      titleClass="h3 text-white bg-opacity-100"
      show={!currentAddress || !metaMaskWallet}>
        <div className="d-flex flex-column text-center align-items-center">
        <strong className="caption-small d-block text-uppercase text-white-50 mb-3 pb-1">
          {t('connect-wallet-button:to-access-this-page')}<br/><span style={{color: networkMap[REQUIRED_NETWORK.toLowerCase()]}}><span>{REQUIRED_NETWORK}</span> {t('connect-wallet-button:network')}</span> {t('connect-wallet-button:on-your-wallet')}
        </strong>
          <div className="d-flex justify-content-center align-items-center w-100">
              <div className="rounded-8 bg-dark-gray text-white p-3 d-flex text-center justify-content-center align-items-center w-75 cursor-pointer" onClick={connectWallet}>
                  <Image src={metamaskLogo} width={15} height={15}/>
                  <span className="text-white text-uppercase ms-2 caption-large">{t('misc.metamask')}</span>
              </div>
        </div>

        <div className="small-info text-ligth-gray text-center text-dark text-uppercase mt-1 pt-1">
          {t('misc.by-connecting')}{" "}
          <a
            href="https://www.bepro.network/terms-and-conditions"
            target="_blank"
            className="text-decoration-none text-primary"
          >
            {t('misc.terms-and-conditions')}
          </a>{" "}
          <br /> &{" "}
          <a
            href="https://www.bepro.network/privacy"
            target="_blank"
            className="text-decoration-none text-primary"
          >
            {t('misc.privacy-policy')}
          </a>
        </div>
      </div>
      </Modal>
    )

  if (!metaMaskWallet)
    return <Button color='white' className='text-primary bg-opacity-100' onClick={connectWallet}><span>{t('main-nav.connect')}</span> <i className="ico-metamask" /></Button>

  return children;

}
