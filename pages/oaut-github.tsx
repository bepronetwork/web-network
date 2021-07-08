import {useEffect, useState} from 'react';
import GithubButton from '../components/github-button';

export default function OathGithub() {
  const [hasCode, setCodeState] = useState<null|boolean>(null);

  function checkForGithubCode() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    setCodeState(urlSearchParams.has(`code`));
    //todo: send code to the microservice if it exists
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
