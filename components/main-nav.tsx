import Image from 'next/image'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useState } from 'react';

import HelpIcon from '@assets/icons/help-icon';
import PlusIcon from '@assets/icons/plus-icon';
import BeproLogo from '@assets/icons/bepro-logo';
import BeproSmallLogo from '@assets/icons/bepro-small-logo';
import ExternalLinkIcon from '@assets/icons/external-link-icon';

import Button from '@components/button';
import HelpModal from '@components/help-modal';
import Translation from '@components/translation';
import InternalLink from '@components/internal-link';
import NetworkIdentifier from '@components/network-identifier';
import WrongNetworkModal from '@components/wrong-network-modal';
import ConnectWalletButton from '@components/connect-wallet-button';
import UserMissingModal from '@components/user-missing-information';
import BalanceAddressAvatar from '@components/balance-address-avatar';
import TransactionsStateIndicator from '@components/transactions-state-indicator';

import { ApplicationContext } from '@contexts/application';

import { IPFS_BASE } from 'env';

import { truncateAddress } from '@helpers/truncate-address';
import { formatNumberToNScale } from '@helpers/formatNumber';

import { User } from '@interfaces/api-response';

import { changeStakedState } from '@reducers/change-staked-amount';

import { BeproService } from '@services/bepro-service';

import useApi from '@x-hooks/use-api';
import useNetwork from '@x-hooks/use-network';

const CURRENCY = process.env.NEXT_PUBLIC_NATIVE_TOKEN_NAME;
const REQUIRED_NETWORK = process.env.NEXT_PUBLIC_NEEDS_CHAIN_NAME;

export default function MainNav() {
  const {dispatch, state: {currentAddress, balance, accessToken}} = useContext(ApplicationContext);
  const {asPath} = useRouter()

  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [address, setAddress] = useState<string>(null);
  const [ethBalance, setEthBalance] = useState(0);
  const [beproBalance, setBeproBalance] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [modalUserMissing, setModalUserMissing] = useState<boolean>(false);
  const {getUserOf,} = useApi();
  const { network, getURLWithNetwork } = useNetwork()

  useEffect(() => {
    checkLogin();
  }, []); // initial load

  const checkLogin = async () => {
    //await login();
    if (BeproService.isLoggedIn) {
      setAddress(BeproService.address);
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }

  function updateAddress(address) {
    setAddress(truncateAddress(address, 4));
  }

  function updateBalances() {
    setBeproBalance(balance.bepro);
    setEthBalance(balance.eth);
    changeStakedState(balance.staked);
  }

  function updateState() {
    if (!currentAddress)
      return;

    updateAddress(BeproService.address);
    BeproService.getBalance('eth').then(setEthBalance);
    BeproService.getBalance('bepro').then(setBeproBalance);
    BeproService.network.getBEPROStaked().then(amount => dispatch(changeStakedState(amount)));
  }

  const login = async () => {
    updateAddress(BeproService.address);
    setEthBalance(await BeproService.getBalance('eth'))
    setBeproBalance(await BeproService.getBalance('bepro'))
    setLoggedIn(true);
    dispatch(changeStakedState(await BeproService.network.getBEPROStaked()));
    getUserOf(BeproService.address)
      .then((user: User) => {
        if(!user?.accessToken && user?.githubLogin) setModalUserMissing(true)
      })
  }

  useEffect(updateState, [currentAddress]);
  useEffect(updateBalances, [balance])

  return (
    <div className="main-nav d-flex align-items-center justify-content-between">

      <div className="d-flex">
        <InternalLink href="/" icon={network?.fullLogo ? <Image src={`${IPFS_BASE}/${network?.fullLogo}`} width={104} height={32} /> : <BeproLogo aria-hidden={true} />} className="brand" nav active />
        <ul className="nav-links">
          <li>
            <InternalLink href={getURLWithNetwork('/developers')} label={<Translation label={'main-nav.developers'} />} nav uppercase />
          </li>

          <li>
            <InternalLink href={getURLWithNetwork('/council')} label={<Translation label={'main-nav.council'} />} nav uppercase />
          </li>

          <li>
            <InternalLink href={getURLWithNetwork('/oracle')} label={<Translation label={'main-nav.Oracle'} />} nav uppercase />
          </li>
        </ul>
      </div>

      <div className="d-flex flex-row align-items-center">
        <a href="https://support.bepro.network/en/articles/5595864-using-the-testnet" className='d-flex align-items-center mr-3 text-decoration-none text-white text-uppercase main-nav-link opacity-75 opacity-100-hover' target="_blank">
          <span><Translation label={'main-nav.get-started'} /></span>
          <ExternalLinkIcon className="ml-1"/>
        </a>

        <InternalLink href={getURLWithNetwork('/create-bounty')} icon={<PlusIcon />} label={<Translation label={'main-nav.create-bounty'} />} className="mr-2" iconBefore nav uppercase />

        <Button onClick={() => setShowHelp(true)}  className="ms-2 me-4 opacity-75 opacity-100-hover" transparent rounded><HelpIcon /></Button>

        <WrongNetworkModal requiredNetwork={REQUIRED_NETWORK} />

        <ConnectWalletButton onSuccess={login} onFail={checkLogin}>
          <div className="d-flex account-info align-items-center">

            <TransactionsStateIndicator />

            <NetworkIdentifier />

            <InternalLink href={getURLWithNetwork('/account')} icon={<BeproSmallLogo />} label={formatNumberToNScale(beproBalance)} className="mx-3" transparent nav />

            <InternalLink href={getURLWithNetwork('/account')} icon={<BalanceAddressAvatar address={address} balance={ethBalance} currency={CURRENCY} />} className="meta-info d-flex align-items-center" />
          </div>
        </ConnectWalletButton>
      </div>

      <HelpModal show={showHelp} onCloseClick={() => setShowHelp(false)} />
      <UserMissingModal show={modalUserMissing} />
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}

