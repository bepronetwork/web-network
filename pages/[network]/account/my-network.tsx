import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Account from '@components/account'
import InternalLink from '@components/internal-link'
import NothingFound from '@components/nothing-found'

import useNetwork from '@x-hooks/use-network'

export default function MyNetwork() {
  const { t } = useTranslation(['common'])
  const { getURLWithNetwork } = useNetwork()

  return (
    <Account>
      <div className="container pt-2">
        <NothingFound description="You don't have a custom network created">
          <InternalLink
            href={getURLWithNetwork('/new-network')}
            label={String(t('actions.create-one'))}
            uppercase
          />
        </NothingFound>
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
        'connect-wallet-button',
        'my-oracles',
        'bounty',
        'pull-request'
      ]))
    }
  }
}
