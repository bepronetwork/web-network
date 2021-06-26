import { GetStaticProps } from 'next'
import React, { useContext, useEffect, useState } from 'react';
import AccountHero from '../components/account-hero';
import IssueListItem from '../components/issue-list-item';
import BeproService from '../services/bepro';

export default function PageAccount() {
  useEffect(() => {
    getMyIssues();
  }, []); // initial load

  const getMyIssues = async () => {
    await BeproService.login();
    const beproAddress = await BeproService.getAddress();
    console.log('await BeproService.bepro.getIssuesByAddress():', await BeproService.network.getIssuesByAddress(beproAddress));
  }

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
