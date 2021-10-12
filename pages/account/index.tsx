import { GetStaticProps } from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import Link from 'next/link';
import IssueListItem from '@components/issue-list-item';
import GithubMicroService from '@services/github-microservice';
import Account from '@components/account';
import {ApplicationContext} from '@contexts/application';
import {IssueData} from '@interfaces/issue-data';
import NothingFound from '@components/nothing-found';
import Paginate from '@components/paginate';
import usePage from '@x-hooks/use-page';
import useCount from '@x-hooks/use-count';
import {useRouter} from 'next/router';

export default function MyIssues() {

  const {dispatch, state: {myIssues, beproInit, metaMaskWallet, currentAddress}} = useContext(ApplicationContext)
  const [issues, setIssues] = useState<IssueData[]>([]);
  const page = usePage();
  const pages = useCount();
  const router = useRouter();

  let issueChild;

  function getIssueList() {
    if (!currentAddress)
      return;

    GithubMicroService.getUserOf(currentAddress)
    .then((user)=> {
      if (user)
        return GithubMicroService.getIssuesByGhLogin(user?.githubLogin)
                                 .then(({rows, count}) => {
                                   pages.setCount(count);
                                   return rows
                                 });
      else return [];
    })
    .then(setIssues)
  }

  useEffect(getIssueList, [currentAddress])

  if (!beproInit || !metaMaskWallet)
    issueChild = (<div className="col-md-10">{!metaMaskWallet ? `Connect your wallet` : `Loading`}...</div>)
  else if (!myIssues.length)
    issueChild = (
    <div className="col-md-10">
      <div className="mt-4">
        <NothingFound
          description="No issues">
          <Link href="/create-issue" passHref>
            <button className="btn btn-md btn-primary">
              create one
            </button>
          </Link>
        </NothingFound>
      </div>
    </div>)
  else issueChild = issues.map(issue =>
                                 <div className="col-md-10" key={issue.issueId}><IssueListItem issue={issue} /></div>)

  return (
    <Account buttonPrimaryActive={true}>
      <div className="container p-footer">
        <div className="row justify-content-center">
          {issueChild}
          <Paginate count={pages.count} onChange={(page) => router.push({pathname: `/`, query:{page}})} />
        </div>
      </div>
    </Account>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
