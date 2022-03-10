import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, ReactNodeArray, useContext, useEffect, useState } from 'react'

import PageHero, { IInfosHero } from '@components/page-hero'
import InternalLink from '@components/internal-link'

import useNetwork from '@x-hooks/use-network'
import { BeproService } from '@services/bepro-service'
import { ApplicationContext } from '@contexts/application'

export default function Oracle({children}) {
  const { asPath } = useRouter()
  const {state: {beproInit}} = useContext(ApplicationContext)
  const { network: activeNetwork, getURLWithNetwork } = useNetwork()
  const { t } = useTranslation(['oracle', 'common'])

  const [infos, setInfos] = useState<IInfosHero[]>([
    {
      value: 0,
      label: t('common:heroes.in-progress')
    },{
      value: 0,
      label: t('common:heroes.bounties-closed')
    },{
      value: 0,
      label: t('common:heroes.bounties-in-network'),
      currency: 'BEPRO'
    }
  ])
  
  async function loadTotals() {
    if (!beproInit || !activeNetwork)
      return;

    const [closed, inProgress, onNetwork] = await Promise.all([
      BeproService.getClosedIssues(activeNetwork.networkAddress),
      BeproService.getOpenIssues(activeNetwork.networkAddress),
      BeproService.getTokensStaked(activeNetwork.networkAddress)
    ])
    setInfos([
      {
        value: inProgress,
        label: t('common:heroes.in-progress')
      },{
        value: closed,
        label: t('common:heroes.bounties-closed')
      },{
        value: onNetwork,
        label: t('common:heroes.bounties-in-network'),
        currency: 'BEPRO'
      },{
        value: 0,
        label: t('common:heroes.protocol-members'),
      }
    ])
  }

  useEffect(()=>{loadTotals()}, [beproInit, activeNetwork]);

  return (
    <div>
      <PageHero title={t('oracle:title')} subtitle={t('oracle:subtitle')}  infos={infos} />
      <div className="container pt-3">
        <div className="row">
          <div className="d-flex justify-content-center">
            <InternalLink
              href={getURLWithNetwork('/oracle/new-bounties')}
              label={String(t('new-bounties'))}
              className={clsx('mr-3 h3 p-0')}
              active={(asPath.endsWith('/oracle') && true) || undefined}
              nav
              transparent
            />

            <InternalLink
              href={getURLWithNetwork('/oracle/ready-to-merge')}
              label={String(t('ready-to-merge'))}
              className={clsx('h3 p-0')}
              nav
              transparent
            />
          </div>
        </div>
      </div>
      <div className="container p-footer">
        <div className="row justify-content-center">{children}</div>
      </div>
    </div>
  )
}
