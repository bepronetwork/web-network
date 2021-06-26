import { GetStaticProps } from 'next'
import React from 'react';
import { useEffect, useState } from 'react';
import BeproService from '../services/bepro';
import Link from 'next/link';

export default function MainNav() {

    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [address, setAddress] = useState<string>(null);
    const [beproStaked, setBeproStaked] = useState<number>(0);

    useEffect(() => {
        checkLogin();
    }, []); // initial load

    const checkLogin = async () => {
        if (await BeproService.isLoggedIn()) {
            setAddress(await BeproService.getAddress());
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }

    const login = async () => {
        await BeproService.login();
        const beproAddress = await BeproService.getAddress();
        setAddress(beproAddress);
        setLoggedIn(true);

        setBeproStaked(await BeproService.network.getBEPROStaked())
        // console.log('%c%s', 'color: #00a3cc', await BeproService.bepro.getETHBalance());
    }

    return (
        <div className="main-nav d-flex align-items-center justify-content-between">

                <div className="d-flex">
                    <a href="/">
                        <img
                            className="logo"
                            src="https://64.media.tumblr.com/3cf2d2b58643cb6f46b42a652771b73b/e8afc16b16e16514-bc/s250x400/191e77982d8901585030f596d3e90935d42099ed.png"
                            alt=""
                        />
                    </a>
                    <ul className="nav-links">
                        <li><a href="/developers">Developers</a></li>
                        <li><a href="/council">Council</a></li>
                        <li><a href="/oracle">Oracle</a></li>
                        {/* <li><a href="/">Lists</a></li>
                        <li><a href="/issue">Issue</a></li>
                        <li><a href="/proposal">Proposal</a></li>
                        <li><a href="/account">My account</a></li> */}
                    </ul>
                </div>
                <div className="d-flex flex-row align-items-center">
                    <Link href="/create-issue" >
                        <a className="btn btn-md btn-trans mr-1">+ Create issue</a>
                    </Link>
                    { !loggedIn ?
                        <button className="btn btn-md btn-white" onClick={login}>Connect <i className="ico-metamask ml-1"></i></button>
                    :
                        <div className="d-flex account-info align-items-center">
                            <button className="btn btn-md btn-trans mr-1"><i className="ico-bepro mr-1"></i>{beproStaked}</button>
                            <Link href="/account" >
                                <a className="meta-info d-flex align-items-center">
                                    <div className="d-flex flex-column text-right">
                                        <p className="p-small short-address mb-0">{address}</p>
                                        <p className="p-small mb-0 trans">0.023 ETH</p>
                                    </div>
                                    {/* <img className="avatar circle-2"src="https://uifaces.co/our-content/donated/Xp0NB-TL.jpg" alt="" /> */}
                                </a>
                            </Link>
                        </div>
                    }
                </div>

        </div>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {}
    }
}
