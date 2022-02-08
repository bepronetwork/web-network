import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Settings() {
  return <div>Settings</div>
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
