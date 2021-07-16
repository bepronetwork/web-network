import {useContext, useEffect, useState,} from 'react';
import BeproService from '../services/bepro';
import GithubMicroService from '../services/github-microservice';
import {Errors} from '../interfaces/enums/Errors';
import {ApplicationContext} from '../contexts/application';
import {changeGithubHandle} from '../contexts/reducers/change-github-handle';
import {useSession} from 'next-auth/client';

export default function GithubHandle() {
  const {state: {githubHandle: contextHandle}, dispatch} = useContext(ApplicationContext)
  const [loading, setLoading] = useState<boolean>(true);
  const [session, sessionLoading] = useSession();

  function setHandleIfConnected() {
    if (contextHandle) {
      setLoading(false);
      return;
    }

    if (!session?.user?.name) {
      setLoading(false);
      return;
    }

    dispatch(changeGithubHandle(session.user.name));
    setLoading(false);

  }

  useEffect(setHandleIfConnected, [session]);

  if (loading || sessionLoading)
    return <span className="btn btn-md btn-trans mr-1">Loading..</span>;

  if (contextHandle)
    return <span className="btn btn-md btn-trans mr-1">{contextHandle}</span>;

  return <a href="/api/auth/signin" className="btn btn-md btn-trans mr-1">connect to github</a>;
}
