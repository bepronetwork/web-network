import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import IssueListItem from '../components/issue-list-item';
import PageHero from '../components/page-hero';
import TypographyTest from '../components/typography-test';

export default function Home() {
  return (
      <div>

        <PageHero></PageHero>

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

        {/* <TypographyTest></TypographyTest> */}

      </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
