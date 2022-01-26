import React from 'react';
import {GetServerSideProps,} from 'next/types';
import PageDevelopers from './developers';
import {getSession} from 'next-auth/react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';

export default function Home() {
  return <PageDevelopers />;
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'bounty'])),
    },
  };
};
