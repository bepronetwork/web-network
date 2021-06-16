import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import MainNav from '../components/main-nav';
import PageActions from '../components/page-actions';
import ProposalAddresses from '../components/proposal-addresses';
import ProposalHero from '../components/proposal-hero';
import ProposalProgress from '../components/proposal-progress';

export default function PageProposal() {
  return (
      <>
        <MainNav></MainNav>
        <ProposalHero></ProposalHero>
        <ProposalProgress></ProposalProgress>
        <PageActions></PageActions>
        <ProposalAddresses></ProposalAddresses>
      </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
