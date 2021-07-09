import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import IssueListItem from '../components/issue-list-item';
import PageHero from '../components/page-hero';
import GithubMicroService from '../services/github-microservice';

export default function PageCouncil() {
  const [issues, setIssues] = useState<[]>([]);

  useEffect(() => {
    getIssues()
  },[])

  const getIssues = async () => {
    const issues = await GithubMicroService.getIssuesState({ filterState: "ready"})
    setIssues(issues)
    console.log('issues', issues)
  }

  return (
    <div>
      <PageHero title="Ready to propose" numIssuesInProgress={10} numIssuesClosed={12} numBeprosOnNetwork={120000}></PageHero>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <IssueListItem></IssueListItem>
          </div>
          <div className="col-md-10">
            <IssueListItem></IssueListItem>
          </div>
          <div className="col-md-10">
            <IssueListItem></IssueListItem>
          </div>
          <div className="col-md-10">
            <IssueListItem></IssueListItem>
          </div>
          <div className="col-md-10">
            <IssueListItem></IssueListItem>
          </div>
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
