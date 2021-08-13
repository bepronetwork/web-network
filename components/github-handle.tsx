import {useContext,} from 'react';
import {ApplicationContext} from '@contexts/application';
import Avatar from 'components/avatar';

export default function GithubHandle() {
  const {state: {githubHandle: contextHandle}, dispatch} = useContext(ApplicationContext)

  if (contextHandle)
    return <span className="btn btn-md btn-trans mr-1">{contextHandle} <Avatar userLogin={contextHandle} className="ms-2"/></span>;

  return (<></>)
}
