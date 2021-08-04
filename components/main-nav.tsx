import { GetStaticProps } from "next";
import React, { useCallback, useEffect } from "react";
import Link from "next/link";
import useAccount, { TYPES } from "hooks/useAccount";
import { setLoadingAttributes } from "providers/loading-provider";
import BeproService from "services/bepro";

export default function MainNav() {
  const account = useAccount();
  const handleClickLogin = useCallback(async () => {
    try {
      setLoadingAttributes(true);
      await BeproService.login();

      const address = await BeproService.getAddress();
      const beproStaked = await BeproService.network.getBEPROStaked();

      account.dispatch({
        type: TYPES.SET,
        props: {
          isConnected: true,
          address,
          beproStaked,
        },
      });
      setLoadingAttributes(false);
    } catch (error) {
      console.log("useAccount handleClickLogin", error);
      setLoadingAttributes(false);
    }
  }, []);

  useEffect(() => {
    handleClickLogin();
  }, [account.oracles.tokensLocked]);

  return (
    <div className="main-nav d-flex align-items-center justify-content-between">
      <div className="d-flex">
        <Link href="/" passHref>
          <a>
            <img
              className="logo"
              src="https://64.media.tumblr.com/3cf2d2b58643cb6f46b42a652771b73b/e8afc16b16e16514-bc/s250x400/191e77982d8901585030f596d3e90935d42099ed.png"
              alt="BEPRO WEB Network"
            />
          </a>
        </Link>
        <nav className="nav-links">
          <Link href="/developers">Developers</Link>
          <Link href="/council">Council</Link>
          <Link href="/oracle">Oracle</Link>
        </nav>
      </div>
      <div className="d-flex flex-row align-items-center">
        <Link href="/create-issue" passHref>
          <a className="btn btn-md btn-trans mr-1">+ Create issue</a>
        </Link>
        {!account.isConnected ? (
          <button className="btn btn-md btn-white" onClick={handleClickLogin}>
            Connect <i className="ico-metamask ml-1"></i>
          </button>
        ) : (
          <div className="d-flex account-info align-items-center">
            <Link href="/account" passHref>
              <a className="btn btn-md btn-trans mr-1">
                <i className="ico-bepro mr-1"></i>
                {account.beproStaked}
              </a>
            </Link>
            <Link href="/account" passHref>
              <a className="meta-info d-flex align-items-center">
                <div className="d-flex flex-column text-right">
                  <p className="p-small short-address mb-0">
                    {account.address}
                  </p>
                  <p className="p-small mb-0 trans">0.023 ETH</p>
                </div>
                {/* <img className="avatar circle-2"src="https://uifaces.co/our-content/donated/Xp0NB-TL.jpg" alt="" /> */}
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
