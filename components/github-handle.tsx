import {useEffect, useState} from 'react';
import BeproService from '../services/bepro';
import GithubMicroService from '../services/github-microservice';
import {Errors} from "../interfaces/enums/Errors";

export default function GithubHandle() {
  const [handle, setHandle] = useState<string>(``);
  const [loading, setLoading] = useState<boolean>(true);
  const url = `https://github.com/login/oauth/authorize?scope=user&client_id=${process.env.GITHUB_OAUTH_CLIENT_ID}&redirect_uri=${process.env.GITHUB_OAUTH_REDIRECT}`;

  function setHandleIfConnected() {

    BeproService.isLoggedIn()
                .then(bool => {
                  if (!bool)
                    throw new Error(Errors.WalletNotConnected);

                  return BeproService.getAddress();
                })
                .then(BeproService.getAddress)
                .then(GithubMicroService.getHandleOf)
                .then(setHandle)
                .catch(e => {
                  console.log(`Error`,e );
                })
                .finally(() => setLoading(false))
  }

  useEffect(setHandleIfConnected, []);

  if (loading)
    return <span>wait..</span>;

  if (handle)
    return <span>{handle}</span>;

  return <a href={url}>connect to github</a>;
}
