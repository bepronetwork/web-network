import React from 'react'
import { GetServerSideProps } from 'next'
import ListIssues from '@components/list-issues'
import PageHero from '@components/page-hero'
import { getSession } from 'next-auth/react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

export default function PageCouncil() {
  const { t } = useTranslation(['common', 'council'])

  return (
    <div>
      <PageHero title={t('council:title')} />
      
      <ListIssues filterState="ready" emptyMessage={t('council:empty')} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'bounty', 'council']))
    }
  }
}
