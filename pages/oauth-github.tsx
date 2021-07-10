import {useEffect, useState} from 'react';
import BeproService from '../services/bepro';
import GithubMicroService from '../services/github-microservice';
import GithubHandle from "../components/github-handle";
import ConnectWalletButton from "../components/connect-wallet-button";

export default function OathGithub() {
  const [hasCode, setCodeState] = useState<null|boolean>(null);

  function checkForGithubCode() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    setCodeState(urlSearchParams.has(`code`));

    if (!hasCode)
      return;

    GithubMicroService
      .tradeTokenForHandle(urlSearchParams.get(`code`))
      .then(async (handle) => {
        const address = await BeproService.getAddress();
        return {handle, address};
      })
      .then(({handle, address}) =>
              GithubMicroService.joinAddressToHandle(address, handle))
      .then(() => window.location.pathname = `/account`)
      .catch((error) => {
        console.log(`error`, error);
        window.location.pathname = `/`;
      });
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
