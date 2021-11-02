import {GetStaticProps} from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, {useContext} from 'react';
import {useEffect, useState} from 'react';
import {BeproService} from '@services/bepro-service';
import ConnectWalletButton from './connect-wallet-button';
import {ApplicationContext} from '@contexts/application';
import {changeStakedState} from '@reducers/change-staked-amount';
import { formatNumberToNScale, formatNumberToString } from 'helpers/formatNumber';
import NetworkIdentifier from '@components/network-identifier';
import BeproLogo from '@assets/icons/bepro-logo';
import HelpIcon from '@assets/icons/help-icon';
import HelpModal from '@components/help-modal';
import ExternalLinkIcon from '@assets/icons/external-link-icon';
import TransactionsStateIndicator from '@components/transactions-state-indicator';
import WrongNetworkModal from '@components/wrong-network-modal';
import Button from './button';
import PlusIcon from '@assets/icons/plus-icon';
import BeproSmallLogo from '@assets/icons/bepro-small-logo';
import { truncateAddress } from '@helpers/truncate-address';
import InternalLink from './internal-link';
import BalanceAddressAvatar from './balance-address-avatar';

const CURRENCY = process.env.NEXT_PUBLIC_NATIVE_TOKEN_NAME;
const REQUIRED_NETWORK = process.env.NEXT_PUBLIC_NEEDS_CHAIN_NAME;

export default function MainNav() {
  const {dispatch, state: {currentAddress, balance}} = useContext(ApplicationContext);
  const {asPath} = useRouter()

  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [address, setAddress] = useState<string>(null);
  const [ethBalance, setEthBalance] = useState(0);
  const [beproBalance, setBeproBalance] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

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
  }

  useEffect(updateState, [currentAddress]);
  useEffect(updateBalances, [balance])

  return (
    <div className="main-nav d-flex align-items-center justify-content-between">

      <div className="d-flex">
        <InternalLink href="/" icon={<BeproLogo aria-hidden={true} />} className="brand" nav active />
        <ul className="nav-links">
          <li>
            <InternalLink href="/developers" label="Developers" nav uppercase />
          </li>

          <li>
            <InternalLink href="/council" label="Council" nav uppercase />
          </li>

          <li>
            <InternalLink href="/oracle" label="Oracle" nav uppercase />
          </li>
        </ul>
      </div>

      <div className="d-flex flex-row align-items-center">
        <a href="https://support.bepro.network/en/articles/5595864-using-the-testnet" className='text-decoration-none' target="_blank">
          <Button transparent className="opacity-75 opacity-100-hover"><span>Get Started</span><ExternalLinkIcon className="ml-1"/></Button>
        </a>

        <InternalLink href="/create-issue" icon={<PlusIcon />} label="Create issue" iconBefore nav uppercase />

        <Button onClick={() => setShowHelp(true)}  className="ms-2 me-3 opacity-75 opacity-100-hover" transparent rounded><HelpIcon /></Button>

        <WrongNetworkModal requiredNetwork={REQUIRED_NETWORK} />

        <ConnectWalletButton onSuccess={login} onFail={checkLogin}>
          <div className="d-flex account-info align-items-center">

            <TransactionsStateIndicator />

            <NetworkIdentifier />

            <InternalLink href="/account" icon={<BeproSmallLogo />} label={formatNumberToNScale(beproBalance)} transparent nav />

            <InternalLink href="/account" icon={<BalanceAddressAvatar address={address} balance={ethBalance} currency={CURRENCY} />} className="meta-info d-flex align-items-center" />
          </div>
        </ConnectWalletButton>
      </div>

      <HelpModal show={showHelp} onCloseClick={() => setShowHelp(false)} />

    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}

