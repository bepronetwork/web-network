import {GetStaticProps} from 'next'
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
        <InternalLink href="/" component="a" passHref active>
          <BeproLogo aria-hidden={true} />
        </InternalLink>
        <ul className="nav-links">
          <li>
            <InternalLink href="/developers" active={asPath === '/developers'} variant="nav" passHref transparent>
              Developers
            </InternalLink>
          </li>

          <li>
            <InternalLink href="/council" active={asPath === '/council'} variant="nav" passHref transparent>
              Council
            </InternalLink>
          </li>

          <li>
            <InternalLink href="/oracle" active={asPath === '/oracle'} variant="nav" passHref transparent>
              Oracle
            </InternalLink>
          </li>
          {/* <li><a href="/">Lists</a></li>
                        <li><a href="/issue">Issue</a></li>
                        <li><a href="/proposal">Proposal</a></li>
                        <li><a href="/account">My account</a></li> */}
        </ul>
      </div>
      <div className="d-flex flex-row align-items-center">
        <a href="https://support.bepro.network/en/articles/5595864-using-the-testnet" className='text-decoration-none' target="_blank">
          <Button transparent className="opacity-75 opacity-100-hover"><span>Get Started</span><ExternalLinkIcon className="ml-1"/></Button>
        </a>
        <InternalLink href="/create-issue" passHref transparent>
          <PlusIcon /> 
          <span>Create issue</span>
        </InternalLink>
        <Button onClick={() => setShowHelp(true)}  className="ms-2 me-3 opacity-75 opacity-100-hover" transparent rounded><HelpIcon /></Button>
        <WrongNetworkModal requiredNetwork={REQUIRED_NETWORK} />

        <ConnectWalletButton onSuccess={login} onFail={checkLogin}>
          <div className="d-flex account-info align-items-center">

            <TransactionsStateIndicator />

            <NetworkIdentifier />

            <InternalLink href="/account" className="mr-1" passHref transparent>
              <span>{formatNumberToNScale(beproBalance)}</span>
              <BeproSmallLogo />
            </InternalLink>

            <InternalLink href="/account" component="a" className="meta-info d-flex align-items-center" active passHref>
                <div className="d-flex flex-column text-right">
                  <p className="p-small mb-0">
                    {address}
                  </p>
                  <p className="p-small mb-0 trans">{formatNumberToString(ethBalance)} {CURRENCY}</p>
                </div>
                {/* <img className="avatar circle-2"src="https://uifaces.co/our-content/donated/Xp0NB-TL.jpg" alt="" /> */}
            </InternalLink>
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

