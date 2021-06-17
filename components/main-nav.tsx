import { GetStaticProps } from 'next'
import React from 'react';
import { useEffect, useState } from 'react';
import BeproService from '../services/bepro';

export default function MainNav() {

    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [address, setAddress] = useState<string>(null);

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
        setAddress(await BeproService.getAddress());
        setLoggedIn(true);
        // console.log('await BeproService.bepro.getETHNetwork():', await BeproService.bepro.getETHNetwork());
        // console.log('await BeproService.bepro.getETHBalance():', await BeproService.bepro.getETHBalance());
    }

    return (
        <div className="main-nav">
            <div className="d-flex justify-content-between align-center">
                <div className="d-flex">
                    <a href="/">
                        <img
                            className="logo"
                            src="https://64.media.tumblr.com/3cf2d2b58643cb6f46b42a652771b73b/e8afc16b16e16514-bc/s250x400/191e77982d8901585030f596d3e90935d42099ed.png"
                            alt=""
                        />
                    </a>
                    <ul className="nav-links">
                        <li><a href="/">Lists</a></li>
                        <li><a href="/issue">Issue</a></li>
                        <li><a href="/proposal">Proposal</a></li>
                        <li><a href="/account">My account</a></li>
                    </ul>
                </div>
                <div className="d-flex flex-row align-center">
                    <a href="/create-issue" className="btn btn-md btn-trans mr-2">+ Create issue</a>
                    { !loggedIn ?
                        <button className="btn btn-md btn-white" onClick={login}>Connect <i className="ico-metamask ml-1"></i></button>
                        :
                        <span>{address}</span>
                    }
                </div>
            </div>
        </div>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {}
    }
}
