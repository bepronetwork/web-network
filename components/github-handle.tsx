import {useContext, useEffect, useState,} from 'react';
import BeproService from '../services/bepro';
import GithubMicroService from '../services/github-microservice';
import {Errors} from "../interfaces/enums/Errors";
import {ApplicationContext} from '../contexts/application';
import {changeGithubHandle} from '../contexts/reducers/change-github-handle';

export default function GithubHandle() {
  const {state: {githubHandle: handle}, dispatch} = useContext(ApplicationContext)
  const [loading, setLoading] = useState<boolean>(true);

  const url = new URL(`/login/oauth/authorize`, `https://github.com`)
  url.searchParams.append(`scope`, `user`);
  url.searchParams.append(`client_id`, process.env.NEXT_PUBLIC_GH_CLIENT_ID);
  url.searchParams.append(`redirect_uri`, process.env.NEXT_PUBLIC_GH_REDIRECT);

  function setHandleIfConnected() {
    if (!handle)
      BeproService.isLoggedIn()
                  .then(bool => {
                    if (!bool)
                      return Promise.reject(Errors.WalletNotConnected);

                    return BeproService.getAddress();
                  })
                  .then(BeproService.getAddress)
                  .then(GithubMicroService.getHandleOf)
                  .then(v => dispatch(changeGithubHandle(v)))
                  .catch(e => {
                    console.log(`Error`,e );
                  })
                  .finally(() => setLoading(false))
  }

  useEffect(setHandleIfConnected, []);

  if (loading)
    return <span>Loading..</span>;

  if (handle)
    return <span>{handle}</span>;

  return <a href={url.toString()}>connect to github</a>;
}
