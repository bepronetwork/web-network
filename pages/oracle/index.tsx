import { GetStaticProps } from 'next/types';
import React from 'react';
import Newissues from './new-bounties';

export default function PageOracle() {
  return <Newissues />;
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
