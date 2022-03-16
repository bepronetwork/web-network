import { useContext, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import NetworksList from '@components/networks-list'
import { useTranslation } from 'next-i18next'

import { changeNetworksSummary } from '@contexts/reducers/change-networks-summary'
import { BeproService } from '@services/bepro-service'
import { ApplicationContext } from '@contexts/application'
import PageHero, { IInfosHero } from '@components/page-hero'

export default function NetworksPage() {
  const { t } = useTranslation(['common', 'custom-network'])

  const [infos, setInfos] = useState<IInfosHero[]>([
    {
      value: 0,
      label: t('custom-network:hero.number-of-networks')
    },{
      value: 0,
      label: t('custom-network:hero.number-of-bounties')
    },{
      value: 0,
      label: t('custom-network:hero.in-the-network'),
      currency: 'USD'
    },{
      value: 0,
      label: t('heroes.protocol-members'),
    }
  ])
  
  const {
    dispatch,
    state: { networksSummary }
  } = useContext(ApplicationContext)

  useEffect(() => {
    BeproService.startNetworkFactory().catch((error) =>
      console.log('Failed to start the Network Factory', error)
    )
  }, [])
  
  useEffect(() => {
    dispatch(
      changeNetworksSummary({
        action: 'reset'
      })
    )
  }, [])

  async function loadTotals() {
    if(!networksSummary) return;

    const [quanty] = await Promise.all([BeproService.getNetworksQuantity()])
    
    setInfos([
      {
        value: quanty,
        label: t('custom-network:hero.number-of-networks')
      },{
        value: networksSummary.bounties,
        label: t('custom-network:hero.number-of-bounties')
      },{
        value: networksSummary.amountInNetwork,
        label: t('custom-network:hero.in-the-network'),
        currency: 'USD'
      }
    ])
  }

  useEffect(()=>{loadTotals()}, [BeproService.isStarted, networksSummary]);

  return (
    <>
      <div>
        <PageHero title={t('custom-network:hero.title')} subtitle={t('custom-network:hero.explanatory-text')} infos={infos}/>

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
