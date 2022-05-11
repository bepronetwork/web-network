import React from 'react';
import {GetServerSideProps, GetStaticProps} from 'next/types';
import PageDevelopers from './developers';
import {getSession} from 'next-auth/react';

export default function Home() {
  return <PageDevelopers />;
}

// export const getStaticProps: GetStaticProps = async () => {
//   return {
//     props: {}
//   }
// }

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {session: await getSession()},
  };
};
