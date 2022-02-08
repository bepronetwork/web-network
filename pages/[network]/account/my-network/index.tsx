import { useContext } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Account from '@components/account'
import NetworksList from '@components/networks-list'

import { ApplicationContext } from '@contexts/application'

export default function MyNetwork() {
  const {
    state: { currentAddress }
  } = useContext(ApplicationContext)

  return (
    <Account>
      <div className="container pt-2">
        <NetworksList creatorAddress={currentAddress} />
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
