import {useContext, useEffect, useState} from 'react';
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PageHero, {IInfosHero} from 'components/page-hero'
import ListIssues from 'components/list-issues'
import { useTranslation } from 'next-i18next'
import { useNetwork } from "contexts/network";
import {ApplicationContext} from 'contexts/application';
import {BeproService} from 'services/bepro-service';
import useApi from '@x-hooks/use-api';


export default function PageDevelopers() {
  const { t } = useTranslation(['common'])

  const {state: {beproInit}} = useContext(ApplicationContext)
  const {getTotalUsers} = useApi();

  const [infos, setInfos] = useState<IInfosHero[]>([
    {
      value: 0,
      label: t('heroes.in-progress')
    },{
      value: 0,
      label: t('heroes.bounties-closed')
    },{
      value: 0,
      label: t('heroes.bounties-in-network'),
      currency: 'BEPRO'
    },{
      value: 0,
      label: t('heroes.protocol-members'),
    }
  ])

  const { activeNetwork } = useNetwork()

  async function loadTotals() {
    if (!beproInit || !activeNetwork)
      return;

    const [closed, inProgress, onNetwork, totalUsers] = await Promise.all([
      BeproService.getClosedIssues(activeNetwork.networkAddress),
      BeproService.getOpenIssues(activeNetwork.networkAddress),
      BeproService.getTokensStaked(activeNetwork.networkAddress),
      getTotalUsers(),
    ])
    setInfos([
      {
        value: inProgress,
        label: t('heroes.in-progress')
      },{
        value: closed,
        label: t('heroes.bounties-closed')
      },{
        value: onNetwork,
        label: t('heroes.bounties-in-network'),
        currency: 'BEPRO'
      },{
        value: totalUsers,
        label: t('heroes.protocol-members'),
      }
    ])
  }

  useEffect(()=>{loadTotals()}, [beproInit, activeNetwork]);

  return (
    <>
      <div>  
        <PageHero
        title={t('heroes.bounties.title')}  
        subtitle={t('heroes.bounties.subtitle')}
        infos={infos}
        />

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
