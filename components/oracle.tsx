import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, ReactNodeArray } from 'react'

import PageHero from '@components/page-hero'
import InternalLink from '@components/internal-link'

import useNetwork from '@x-hooks/use-network'

export default function Oracle({
  children,
  buttonPrimaryActive
}: {
  children?: ReactNode | ReactNodeArray
  buttonPrimaryActive: boolean
}) {
  const { asPath } = useRouter()
  const { t } = useTranslation(['oracle'])

  const { getURLWithNetwork } = useNetwork()

  return (
    <div>
      <PageHero title={t('title')} />
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
