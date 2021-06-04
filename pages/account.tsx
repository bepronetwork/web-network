import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import IssueListItem from '../components/issue-list-item';
import MainNav from '../components/main-nav';
import PageHero from '../components/page-hero';
import TypographyTest from '../components/typography-test';

export default function PageAccount() {
  return (
      <div>
        <MainNav></MainNav>
        <h1 className="h1">Oracle</h1>
      </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
