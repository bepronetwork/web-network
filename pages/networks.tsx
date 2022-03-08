import { useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import NetworksHero from '@components/networks-hero'
import NetworksList from '@components/networks-list'

import { BeproService } from '@services/bepro-service'

export default function NetworksPage() {
  useEffect(() => {
    BeproService.startNetworkFactory().catch((error) =>
      console.log('Failed to start the Network Factory', error)
    )
  }, [])

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
      ...(await serverSideTranslations(locale, ['common', 'custom-network']))
    }
  }
}
