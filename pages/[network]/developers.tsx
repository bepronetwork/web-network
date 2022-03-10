import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PageHero from '@components/page-hero'
import ListIssues from '@components/list-issues'
import { useTranslation } from 'next-i18next'

export default function PageDevelopers() {
  const { t } = useTranslation(['common'])

  return (
    <>
      <div>  
        <PageHero title={t('heroes.bounties.title')}  subtitle={t('heroes.bounties.subtitle')}/>

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
