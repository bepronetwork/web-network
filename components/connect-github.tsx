import { useTranslation } from 'next-i18next'
import { signIn, signOut } from 'next-auth/react'

import GithubImage from '@components/github-image'

import { useNetwork } from '@contexts/network'
import { useAuthentication } from '@contexts/authentication'

import useApi from '@x-hooks/use-api'

export default function ConnectGithub() {
  const { t } = useTranslation('common')
  
  const api = useApi()
  const { wallet } = useAuthentication()
  const { activeNetwork } = useNetwork()

  async function clickSignIn() {
    await signOut({ redirect: false })

    localStorage.setItem(`lastAddressBeforeConnect`, wallet?.address)
    
    const user = await api.getUserOf(wallet?.address)

    return signIn('github', {
      callbackUrl: `${window.location.protocol}//${
        window.location.host
      }/${activeNetwork.name.toLowerCase()}/connect-account${
        !!user ? `?migrate=1` : ``
      }`
    })
  }

  return (
    <div className="container-fluid">
      <div className="row mtn-4 mb-2">
        <div className="col text-center px-0">
          <div className="content-wrapper py-3 border-radius-8 bg-dark-gray">
            <GithubImage />{' '}
            <span className="caption-small mx-3">
              {t('actions.connect-github')}
            </span>
            <button
              className="btn btn-primary text-uppercase"
              onClick={() => clickSignIn()}
            >
              {t('actions.connect')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
