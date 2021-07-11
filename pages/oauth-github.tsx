import React, {useEffect, useState} from 'react';
import BeproService from '../services/bepro';
import GithubMicroService from '../services/github-microservice';
import GithubHandle from "../components/github-handle";
import ConnectWalletButton from "../components/connect-wallet-button";

export default function OathGithub() {
  const [hasCode, setCodeState] = useState<boolean>(false);

  function checkForGithubCode() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    setCodeState(urlSearchParams.has(`code`));

    if (urlSearchParams.has(`error`))
      return console.log(urlSearchParams.get(`error`), urlSearchParams.get(`error_description`));

    if (!urlSearchParams.has(`code`))
      return;

    GithubMicroService
      .tradeTokenForHandle(urlSearchParams.get(`code`))
      .then((handle) =>
              GithubMicroService.joinAddressToHandle({handle, address: BeproService.address}))
      .then(() => {
        // todo: redirect user to account
      })
      .catch((error) => {
        // todo: redirect user to root
      })
  }


  useEffect(checkForGithubCode, [])

  return <div>
    <div className="container">
      <div className="row justify-content-center mb-5">
        <div className="content-wrapper">
          { !hasCode ? <ConnectWalletButton> <GithubHandle /> </ConnectWalletButton> : `Wait...`}
        </div>
      </div>
    </div>
  </div>
}
