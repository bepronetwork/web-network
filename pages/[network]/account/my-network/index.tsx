import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Account from '@components/account'
import NetworksList from '@components/networks-list'

import { useAuthentication } from '@contexts/authentication'

export default function MyNetwork() {
  const { wallet } = useAuthentication()

  return (
    <Account>
      <div className="container pt-2">
        <NetworksList creatorAddress={wallet?.address || 'not-found'} />
      </div>
    </Account>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
        'connect-wallet-button',
        'my-oracles',
        'bounty',
        'pull-request',
        'custom-network'
      ]))
    }
  }
}
