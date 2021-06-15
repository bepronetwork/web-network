import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import MainNav from '../components/main-nav';
import PageActions from '../components/page-actions';
import ProposalHero from '../components/proposal-hero';
import ProposalProgress from '../components/proposal-progress';

export default function PageProposal() {
  return (
      <div>
        <MainNav></MainNav>
        <ProposalHero></ProposalHero>
        <ProposalProgress></ProposalProgress>

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="content-wrapper mb-4">
                <h3 className="smallCaption pb-3">3 addresses</h3>
                <div className="content-list-item d-flex justify-content-between align-items-center">
                  <p className="p-small mb-0">0xE1...Zr7u</p>
                  <p className="smallCaption color-purple mb-0">150 oracles</p>
                </div>
                <div className="content-list-item d-flex justify-content-between align-items-center">
                  <p className="p-small mb-0">0xE1...Zr7u</p>
                  <p className="smallCaption color-purple mb-0">150 oracles</p>
                </div>
                <div className="content-list-item d-flex justify-content-between align-items-center">
                  <p className="p-small mb-0">0xE1...Zr7u</p>
                  <p className="smallCaption color-purple mb-0">150 oracles</p>
                </div>
              </div>
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
