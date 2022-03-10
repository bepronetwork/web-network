import {GetServerSideProps, GetStaticProps} from 'next/types';
import React from 'react';
import Newissues from './new-bounties';
import {getSession} from 'next-auth/react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';

export default function PageOracle() {
  return <Newissues />;
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'bounty', 'oracle'])),
    },
  };
};
