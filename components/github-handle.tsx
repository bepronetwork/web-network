import {useContext, useEffect, useState,} from 'react';
import Link from 'next/link';
import {ApplicationContext} from '../contexts/application';
import {changeGithubHandle} from '../contexts/reducers/change-github-handle';
import {useSession} from 'next-auth/client';
import GithubImage from './github-image';
import Avatar from 'components/avatar';

export default function GithubHandle() {
  const {state: {githubHandle: contextHandle}, dispatch} = useContext(ApplicationContext)

  if (contextHandle)
    return <span className="btn btn-md btn-trans mr-1">{contextHandle} <Avatar userLogin={contextHandle} className="ms-2"/></span>;

  return (<></>)
}
