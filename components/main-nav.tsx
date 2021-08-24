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
import {formatAddress} from '@helpers/format-address';

export default function MainNav() {
  const {dispatch, state: {currentAddress, balance}} = useContext(ApplicationContext);
  const {asPath} = useRouter()

  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [address, setAddress] = useState<string>(null);
  const [ethBalance, setEthBalance] = useState(0);
  const [beproBalance, setBeproBalance] = useState(0);
  const [network, setNetwork] = useState(``);

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
    setAddress(formatAddress(address));
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
    BeproService.network.getBEPROStaked().then(amount => dispatch(changeStakedState(amount)))
    BeproService.bepro.web3.eth.net.getNetworkType().then(setNetwork);
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

  useEffect(()=> console.log("changed `asPath`", asPath),[asPath])

  return (
    <div className="main-nav d-flex align-items-center justify-content-between">

      <div className="d-flex">
        <Link href="/" passHref>
          <a>
            <img
              className="logo"
              src="https://64.media.tumblr.com/3cf2d2b58643cb6f46b42a652771b73b/e8afc16b16e16514-bc/s250x400/191e77982d8901585030f596d3e90935d42099ed.png"
              alt=""
            />
          </a>
        </Link>
        <ul className="nav-links">
          <li><Link href="/developers" passHref><a
          className={clsx({
            active: asPath === '/developers',
          })}
          >Developers</a></Link></li>
          <li><Link href="/council" passHref><a
          className={clsx({
            active: asPath === '/council',
          })}
          >Council</a></Link></li>
          <li><Link href="/oracle" passHref><a
          className={clsx({
            active: asPath === '/oracle',
          })}
          >Oracle</a></Link></li>
          {/* <li><a href="/">Lists</a></li>
                        <li><a href="/issue">Issue</a></li>
                        <li><a href="/proposal">Proposal</a></li>
                        <li><a href="/account">My account</a></li> */}
        </ul>
      </div>
      <div className="d-flex flex-row align-items-center">
        <Link href="/create-issue" passHref>
          <button className="btn btn-md btn-trans mr-1">+ Create issue</button>
        </Link>
        <ConnectWalletButton onSuccess={login} onFail={checkLogin}>
          <div className="d-flex account-info align-items-center">
            <Link href="/account" passHref>
              <a className="btn btn-md btn-trans mr-1">
                <i className="ico-bepro mr-1"></i>
                {formatNumberToNScale(beproBalance)}
              </a>
            </Link>
            <Link href="/account" passHref>
              <a className="meta-info d-flex align-items-center">
                <div className="d-flex flex-column text-right">
                  <p className="p-small mb-0">{address}</p>
                  <p className="p-small mb-0 trans">{formatNumberToString(ethBalance)} ETH {network}</p>
                </div>
                {/* <img className="avatar circle-2"src="https://uifaces.co/our-content/donated/Xp0NB-TL.jpg" alt="" /> */}
              </a>
            </Link>
          </div>
        </ConnectWalletButton>
      </div>

    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}

