import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import IssueListItem from '../components/issue-list-item';
import MainNav from '../components/main-nav';
import PageHero from '../components/page-hero';
import TypographyTest from '../components/typography-test';
import GithubMicroService from '../services/github-microservice';

export default function PageCouncil() {
  const [issues, setIssues] = useState<[]>([]);

  useEffect(() => {
    getIssues()
  },[])

  const getIssues = async () => {
    const issues = await GithubMicroService.getIssues()
    setIssues(issues)
    console.log('issues', issues)
  }

  return (
    <div>
      <PageHero title="Ready to propose" numIssuesInProgress={10} numIssuesClosed={12} numBeprosOnNetwork={120000}></PageHero>
      {console.log('issues return ->', issues)}
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

      <TypographyTest></TypographyTest>

    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
