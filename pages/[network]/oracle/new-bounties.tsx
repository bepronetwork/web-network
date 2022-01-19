import { getSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { GetServerSideProps } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Oracle from '@components/oracle'
import ListIssues from '@components/list-issues'

export default function Newissues() {
  const { t } = useTranslation()

  return (
    <Oracle buttonPrimaryActive={true}>
      <>
        <ListIssues
          filterState="draft"
          emptyMessage={t('bounty:errors.no-bounties-in-draft')}
        />
      </>
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
