import {useEffect, useState} from 'react';
import BeproService from '../services/bepro';
import GithubMicroService from '../services/github-microservice';

export default function GithubButton() {
  const [handle, setHandle] = useState<string>(``);
  const [loading, setLoading] = useState<boolean>(true);

  function setHandleIfConnected() {

    BeproService.isLoggedIn()
                .then(BeproService.getAddress)
                .then(GithubMicroService.getHandleOf)
                .then(setHandle)
                .catch(e => {
                  console.log(`Error`,e );
                })
                .finally(() => setLoading(false))
  }

  function getButtonView() {
    const url = `https://github.com/login/oauth/authorize?scope=user&client_id=${process.env.GITHUB_OAUTH_CLIENT_ID}&redirect_uri=${process.env.GITHUB_OAUTH_REDIRECT}`;

    return (<a href={url}>connect to github</a>)
  }

  function getHandleView() {
    return (<span>{handle}</span>)
  }

  function getLoadingView() {
    return (<span>wait..</span>)
  }

  useEffect(setHandleIfConnected, []);

  return (<div>{ !loading ? handle ? getHandleView() : getButtonView() : getLoadingView() }</div>)
}
