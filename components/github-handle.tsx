import {useContext, useEffect, useState,} from 'react';
import Link from 'next/link';
import {ApplicationContext} from '../contexts/application';
import {changeGithubHandle} from '../contexts/reducers/change-github-handle';
import {useSession} from 'next-auth/client';
import GithubImage from './github-image';

export default function GithubHandle({hideLoading = false}) {
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

  function isLoading() {
    return loading || sessionLoading;
  }

  useEffect(setHandleIfConnected, [session]);

  if (isLoading() && !hideLoading)
    return <span className="btn btn-md btn-trans mr-1">Loading..</span>;

  if (contextHandle)
    return <span className="btn btn-md btn-trans mr-1">{contextHandle}</span>;

  return (<></>)
}
