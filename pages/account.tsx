import { GetStaticProps } from 'next'
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react';
import AccountHero from '../components/account-hero';
import IssueListItem, { IIssue } from '../components/issue-list-item';
import BeproService from '../services/bepro';
import GithubMicroService from '../services/github-microservice';

export default function PageAccount() {

  const [myIssues, setMyIssues] = useState<IIssue[]>([]);
  useEffect(() => {
    getMyIssues();
  }, []); // initial load

  const getMyIssues = async () => {
    await BeproService.login();
    const beproAddress = await BeproService.getAddress();
    let issueIds = await BeproService.network.getIssuesByAddress(beproAddress);
    issueIds = issueIds.map((i) => i+1)
    if (issueIds.length > 0) {
      const issues = await GithubMicroService.getIssuesIds(issueIds);
      setMyIssues(issues);
    }
  }

  return (
      <div>
        <AccountHero issuesCount={myIssues.length}></AccountHero>
        <div className="container">
          <div className="row">
            <div className="d-flex justify-content-center mb-3">
              <Link href="/account" ><a className="subnav-item active mr-3" href="/account"><h3 className="h3">My issues</h3></a></Link>
              <Link href="/account-oracles" ><a className="subnav-item" href="/account-oracles"><h3 className="h3">My oracles</h3></a></Link>
          </div>
          </div>
        </div>

        <div className="container">
          <div className="row justify-content-center">
            {myIssues.map((issue) => (
              <div className="col-md-10" key={issue.issueId}>
                <IssueListItem issue={issue}></IssueListItem>
              </div>
            ))}

          </div>
        </div>

      </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
