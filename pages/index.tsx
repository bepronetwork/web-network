import React from 'react';
import {GetServerSideProps,} from 'next/types';
import PageDevelopers from './developers';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';

export default function Home() {
  return <PageDevelopers />;
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'bounty'])),
    },
  };
};
