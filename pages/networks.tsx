import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import NetworksHero from '@components/networks-hero'
import NetworksList from '@components/networks-list'

export default function NetworksPage() {
  return (
    <>
      <div>
        <NetworksHero />
        
        <div className="mt-3">
          <NetworksList redirectToHome />
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'custom-network']))
    }
  }
}
