import { getSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { GetServerSideProps } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Oracle from '@components/oracle'
import ListIssues from '@components/list-issues'

export default function ReadyToMergeIssues() {
  const { t } = useTranslation(['common', 'bounty'])

  return (
    <Oracle buttonPrimaryActive={false}>
      <ListIssues
        filterState="ready"
        emptyMessage={t('bounty:errors.no-bounties-to-merge')}
      />
    </Oracle>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'bounty', 'oracle']))
    }
  }
}
