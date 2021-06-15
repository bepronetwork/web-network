import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import IssueComments from '../components/issue-comments';
import IssueDescription from '../components/issue-description';
import IssueHero from '../components/issue-hero';
import MainNav from '../components/main-nav';
import IssueDraftProgress from '../components/issue-draft-progress';
import PageActions from '../components/page-actions';

export default function PageIssue() {
  return (
    <div>

      <MainNav></MainNav>
      <IssueHero></IssueHero>

      {/* <IssueDraftProgress></IssueDraftProgress> */}


      <PageActions></PageActions>

      <IssueDescription></IssueDescription>
      <IssueComments></IssueComments>

    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
