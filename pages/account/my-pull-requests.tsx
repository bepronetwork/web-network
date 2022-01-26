import React, { useContext } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Account from '@components/account'
import ListIssues from '@components/list-issues'

import { ApplicationContext } from '@contexts/application'

export default function MyPullRequests() {
  const {
    state: { githubLogin }
  } = useContext(ApplicationContext)

  const { t } = useTranslation('pull-request')

  return (
    <Account>
      <div className="container p-footer">
        <div className="row justify-content-center">
          <ListIssues
            emptyMessage={String(t('find-a-bounty'))}
            pullRequester={githubLogin}
          />
        </div>
      </div>
    </Account>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, [
        'common',
        'bounty',
        'connect-wallet-button',
        'pull-request'
      ]))
    }
  }
}
