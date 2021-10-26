import {GetStaticProps} from 'next'
import { useRouter } from 'next/router'
import React, {useContext} from 'react';
import {useEffect, useState} from 'react';
import {BeproService} from '@services/bepro-service';
import Link from 'next/link';
import clsx from "clsx";
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
        <Link href="/" passHref>
          <a>
            <BeproLogo aria-hidden={true} />
          </a>
        </Link>
        <ul className="nav-links">
          <li><Link href="/developers" passHref><Button
          transparent className={`${asPath !== '/developers' && 'opacity-75 opacity-100-hover'}`}
          >Developers</Button></Link></li>
          <li><Link href="/council" passHref><Button
          transparent className={`${asPath !== '/council' && 'opacity-75 opacity-100-hover'}`}
          >Council</Button></Link></li>
          <li><Link href="/oracle" passHref><Button
          transparent className={`${asPath !== '/oracle' && 'opacity-75 opacity-100-hover'}`}
          >Oracle</Button></Link></li>
          {/* <li><a href="/">Lists</a></li>
                        <li><a href="/issue">Issue</a></li>
                        <li><a href="/proposal">Proposal</a></li>
                        <li><a href="/account">My account</a></li> */}
        </ul>
      </div>
      <div className="d-flex flex-row align-items-center">
        <a href="https://support.bepro.network/en/articles/5595864-using-the-testnet" className='text-decoration-none' target="_blank">
          <Button transparent className="opacity-75 opacity-100-hover"><span>Get Started</span><ExternalLinkIcon className="ml-1" height={10} width={10} color="text-white"/></Button>
        </a>
        <Link href="/create-issue" passHref>
          <Button transparent className="opacity-75 opacity-100-hover"><PlusIcon /> <span>Create issue</span></Button>
        </Link>
        <Button onClick={() => setShowHelp(true)}  className="ms-2 me-3 text-uppercase opacity-75 opacity-100-hover" transparent rounded><HelpIcon color='white' /></Button>
        <WrongNetworkModal requiredNetwork="kovan" />

        <ConnectWalletButton onSuccess={login} onFail={checkLogin}>
          <div className="d-flex account-info align-items-center">

            <TransactionsStateIndicator />

            <NetworkIdentifier />

            <Link href="/account" passHref>
              <Button className='mr-1 opacity-75 opacity-100-hover' transparent>
                <span>{formatNumberToNScale(beproBalance)}</span>
                <BeproSmallLogo />
              </Button>
            </Link>
            <Link href="/account" passHref>
              <a className="meta-info d-flex align-items-center">
                <div className="d-flex flex-column text-right">
                  <p className="p-small mb-0">
                    {address}
                  </p>
                  <p className="p-small mb-0 trans">{formatNumberToString(ethBalance)} ETH</p>
                </div>
                {/* <img className="avatar circle-2"src="https://uifaces.co/our-content/donated/Xp0NB-TL.jpg" alt="" /> */}
              </a>
            </Link>
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

