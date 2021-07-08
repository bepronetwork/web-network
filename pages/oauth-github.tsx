import {useEffect, useState} from 'react';
import GithubButton from '../components/github-button';
import BeproService from '../services/bepro';
import GithubMicroService from '../services/github-microservice';

export default function OathGithub() {
  const [hasCode, setCodeState] = useState<null|boolean>(null);

  function checkForGithubCode() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    setCodeState(urlSearchParams.has(`code`));

    if (!hasCode)
      return;

    //todo: send code to the microservice if it exists
    const newHandle = ``; // todo: retrieve this from the answer from the microservice?

    BeproService.getAddress()
                .then(address => GithubMicroService.joinAddressToHandle(address, newHandle));
  }


  useEffect(checkForGithubCode, [])

  return <div>
    <div className="container">
      <div className="row justify-content-center mb-5">
        <div className="content-wrapper">
          { !hasCode ? <GithubButton /> : `Wait...`}
        </div>
      </div>
    </div>
  </div>
}
