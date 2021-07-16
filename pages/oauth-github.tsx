import React, {useContext, useEffect, useState} from 'react';
import BeproService from '../services/bepro';
import GithubMicroService from '../services/github-microservice';
import GithubHandle from "../components/github-handle";
import ConnectWalletButton from "../components/connect-wallet-button";
import {useSession} from 'next-auth/client';
import {ApplicationContext} from '../contexts/application';
import {router} from 'next/client';
import {changeGithubHandle} from '../contexts/reducers/change-github-handle';

export default function OathGithub() {
  const [session, loading] = useSession();
  const {state: {githubHandle}, dispatch} = useContext(ApplicationContext);

  if (session?.user?.name && !githubHandle)
    GithubMicroService.joinAddressToHandle({address: BeproService.address, githubHandle})
                      .then(success => {
                        if (!success)
                          return;

                        dispatch(changeGithubHandle(githubHandle));
                        return router.push(`/account`);
                      });

  return <div>
    <div className="container">
      <div className="row justify-content-center mb-5">
        <div className="content-wrapper">
          { !loading && session?.user ? <ConnectWalletButton> <GithubHandle /> </ConnectWalletButton> : `Wait...`}
        </div>
      </div>
    </div>
  </div>
}
