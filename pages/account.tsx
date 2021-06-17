import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import AccountHero from '../components/account-hero';
import IssueListItem from '../components/issue-list-item';

export default function PageAccount() {
  return (
      <div>
        <AccountHero></AccountHero>

        <div className="container">
          <div className="row">
            <div className="d-flex justify-content-center mb-3">
              <a className="subnav-item active mr-3" href="/account"><h3 className="h3">My issues</h3></a>
              <a className="subnav-item" href="/account-oracles"><h3 className="h3">My oracles</h3></a>
          </div>
          </div>
        </div>

        <div className="container">
          <div className="row justify-content-center">
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
