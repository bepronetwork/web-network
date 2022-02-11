import React, { useContext, useEffect } from 'react'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PageHero from '@components/page-hero'
import ListIssues from '@components/list-issues'

import { BeproService } from '@services/bepro-service'

import { ApplicationContext } from '@contexts/application'

export default function PageDevelopers() {

  const {state: {currentAddress}} = useContext(ApplicationContext)

  useEffect(() => {
    if (!BeproService.isStarted) return

    //BeproService.network.disputableTime().then(time => console.log('disputableTime', time)).catch(error => console.log('disputableTime', error))
    //BeproService.network.redeemTime().then(time => console.log('redeemTime', time)).catch(error => console.log('redeemTime', error))
    //BeproService.network.changeRedeemTime(60).then(console.log).catch(error => console.log('redeem', error))
    //BeproService.network.changeDisputableTime(60).then(console.log).catch(error => console.log('disputable', error))
    BeproService.network.callTx(BeproService.network.contract.methods._governor()).then(console.log).catch(console.log)
    //BeproService.network.sendTx(BeproService.network.contract.methods.claimGovernor()).then(console.log).catch(console.log)
  }, [BeproService.isStarted, currentAddress])

  return (
    <>
      <div>
        <PageHero />

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
