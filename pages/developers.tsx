import React from 'react'
import { GetServerSideProps } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PageHero from '@components/page-hero'
import ListIssues from '@components/list-issues'

export default function PageDevelopers() {
  return (
    <>
      <div>
        <PageHero />

        <ListIssues />
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'bounty']))
    }
  }
}
