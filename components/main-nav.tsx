import { GetStaticProps } from 'next'
import React from 'react';
import { useEffect, useState } from 'react';
import BeproService from '../services/bepro';
import Link from 'next/link';
import ConnectWalletButton from "./connect-wallet-button";
import GithubHandle from './github-handle';

export default function MainNav() {

    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [address, setAddress] = useState<string>(null);
    const [beproStaked, setBeproStaked] = useState<number>(0);

    useEffect(() => {
        checkLogin();
    }, []); // initial load

    const checkLogin = async () => {
        //await login();
        if (await BeproService.isLoggedIn()) {
            setAddress(await BeproService.getAddress());
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }

    const login = async () => {
        const beproAddress = await BeproService.getAddress();
        setAddress(beproAddress);
        setLoggedIn(true);

        setBeproStaked(await BeproService.network.getBEPROStaked())
        // console.log('%c%s', 'color: #00a3cc', await BeproService.bepro.getETHBalance());
    }

    // const handleClickLogin = useCallback(async () => {
    //     try {
    //         setLoadingAttributes(true);
    //         await BeproService.login();
    //
    //         const address = await BeproService.getAddress();
    //         const beproStaked = await BeproService.network.getBEPROStaked();
    //
    //         account.dispatch({
    //                              type: TYPES.SET,
    //                              props: {
    //                                  isConnected: true,
    //                                  address,
    //                                  beproStaked,
    //                              },
    //                          });
    //         setLoadingAttributes(false);
    //     } catch (error) {
    //         console.log("useAccount handleClickLogin", error);
    //         setLoadingAttributes(false);
    //     }
    // }, []);
    //
    // useEffect(() => {
    //     handleClickLogin();
    // }, [account.oracles.tokensLocked]);

    return (
        <div className="main-nav d-flex align-items-center justify-content-between">

                <div className="d-flex">
                    <Link href="/" passHref>
                        <img
                            className="logo"
                            src="https://64.media.tumblr.com/3cf2d2b58643cb6f46b42a652771b73b/e8afc16b16e16514-bc/s250x400/191e77982d8901585030f596d3e90935d42099ed.png"
                            alt=""
                        />
                    </Link>
                    <ul className="nav-links">
                        <li><Link href="/developers" ><a href="/developers">Developers</a></Link></li>
                        <li><Link href="/council" ><a href="/council">Council</a></Link></li>
                        <li><Link href="/oracle" ><a href="/oracle">Oracle</a></Link></li>
                        {/* <li><a href="/">Lists</a></li>
                        <li><a href="/issue">Issue</a></li>
                        <li><a href="/proposal">Proposal</a></li>
                        <li><a href="/account">My account</a></li> */}
                    </ul>
                </div>
                <div className="d-flex flex-row align-items-center">
                    <Link href="/create-issue" passHref>
                        <a className="btn btn-md btn-trans mr-1">+ Create issue</a>
                    </Link>
                    <ConnectWalletButton onSuccess={login} onFail={checkLogin}>
                      <div className="d-flex account-info align-items-center">
                        <Link href="/account" passHref>
                          <a className="btn btn-md btn-trans mr-1">
                            <i className="ico-bepro mr-1"></i>
                            {beproStaked}
                          </a>
                        </Link>
                        <Link href="/account" passHref>
                          <a className="meta-info d-flex align-items-center">
                            <div className="d-flex flex-column text-right">
                              <p className="p-small short-address mb-0">
                                {address}
                              </p>
                              <p className="p-small mb-0 trans">0.023 ETH</p>
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

