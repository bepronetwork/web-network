import { GetStaticProps } from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import Link from 'next/link';
import IssueListItem from '@components/issue-list-item';
import GithubMicroService from '@services/github-microservice';
import Account from '@components/account';
import {ApplicationContext} from '@contexts/application';
import {IssueData} from '@interfaces/issue-data';
import NothingFound from '@components/nothing-found';

export default function MyIssues() {

  const {dispatch, state: {myIssues, beproInit, metaMaskWallet}} = useContext(ApplicationContext)
  const [issues, setIssues] = useState<IssueData[]>([]);

  let issueChild;

  function getIssueList() {
    if (!beproInit || !myIssues.length)
      return;

    GithubMicroService.getIssues().then(setIssues)
  }

  useEffect(getIssueList, [beproInit, myIssues])

  if (!beproInit || !metaMaskWallet)
    issueChild = (<div className="col-md-10">{!metaMaskWallet ? `Connect your wallet` : `Loading`}...</div>)
  else if (!myIssues.length)
    issueChild = (
    <div className="col-md-10">
      <div className="mt-4">
        <NothingFound 
          description="No issues"
          action={
            <Link href="/create-issue" passHref>
              <button className="btn btn-md btn-primary">
                create one
              </button>
            </Link>
          } />
      </div>
    </div>)
  else issueChild = issues.map(issue =>
                                 <div className="col-md-10" key={issue.issueId}><IssueListItem issue={issue} /></div>)

  return (
    <Account buttonPrimaryActive={true}>
      <div className="container">
        <div className="row justify-content-center">
          {issueChild}
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
