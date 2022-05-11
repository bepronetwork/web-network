import React, { useContext } from 'react'
import clsx from 'clsx'
import { useTranslation } from 'next-i18next'

import AccountHero from '@components/account-hero'
import InternalLink from '@components/internal-link'
import ConnectGithub from '@components/connect-github'
import ConnectWalletButton from '@components/connect-wallet-button'

import { ApplicationContext } from '@contexts/application'

export default function Account({ children }): JSX.Element {
  const {
    state: { githubHandle, currentAddress }
  } = useContext(ApplicationContext)
  const { t } = useTranslation(['common', 'bounty', 'pull-request'])

  return (
    <div>
      <AccountHero />

      <ConnectWalletButton asModal={true} />

      {(!githubHandle && <ConnectGithub />) || ``}

      <div className="container">
        <div className="row">
          <div className="d-flex justify-content-center mb-3">
            <InternalLink
              href="/account"
              label={String(t('bounty:label_other'))}
              className={clsx('mr-3 h4 p-0 text-capitalize')}
              activeClass="account-link-active"
              nav
            />

            <InternalLink
              href="/account/my-pull-requests"
              label={String(t('pull-request:label_other'))}
              className={clsx('mr-3 h4 p-0 text-capitalize')}
              activeClass="account-link-active"
              nav
            />

            <InternalLink
              href="/account/my-oracles"
              label={String(t('$oracles'))}
              className={clsx('h4 p-0')}
              activeClass="account-link-active"
              nav
            />
          </div>
        </div>
      </div>

      {(currentAddress && children) || <></>}
    </div>
  )
}
