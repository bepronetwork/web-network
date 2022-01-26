import React from 'react'
import { getSession } from 'next-auth/react'
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
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'bounty']))
    }
  }
}
