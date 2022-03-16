import React from 'react'
import { GetServerSideProps } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PageDevelopers from '@pages/[network]/developers'

export default function Home() {
  return <PageDevelopers />
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'bounty']))
    }
  }
}
