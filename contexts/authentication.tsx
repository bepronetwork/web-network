import {
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext
} from 'react'
import { useRouter } from 'next/router'
import { signIn, signOut, useSession } from 'next-auth/react'

import InvalidAccountWalletModal from '@components/invalid-account-wallet-modal'

import { IBalance } from '@interfaces/balance-state'

import { BeproService } from '@services/bepro-service'

import useApi from '@x-hooks/use-api'

export interface IUser {
  name?: string
  login?: string
  email?: string
  image?: string
  address?: string
  accessToken?: string
  balance?: IBalance
}

export interface IAuthenticationContext {
  user?: IUser
  isGithubAndWalletMatched?: boolean
  login: () => void
}

const AuthenticationContext = createContext<IAuthenticationContext>(
  {} as IAuthenticationContext
)

export const AuthenticationProvider = ({ children }) => {
  const session = useSession()
  const { asPath } = useRouter()

  const [user, setUser] = useState<IUser>()
  const [isGithubAndWalletMatched, setIsGithubAndWalletMatched] =
    useState<boolean>()

  const { getUserOf } = useApi()

  const login = useCallback(async () => {
    await signOut({ redirect: false })

    await signIn('github', {
      callbackUrl: `${window.location.protocol}//${window.location.host}/${asPath}`
    })
  }, [asPath])

  const validateWalletAndGithub = useCallback(() => {
    getUserOf(user.address).then(({ githubLogin }) => {
      if (githubLogin === user.login) 
        setIsGithubAndWalletMatched(true)
      else 
        setIsGithubAndWalletMatched(false)
    }).catch(error => {
      setIsGithubAndWalletMatched(false)
      console.log(error)
    })
  }, [user])

  // Side effects needed to the context work
  useEffect(() => {
    if (session.status === 'authenticated') setUser({ ...session.data.user })
  }, [session])

  useEffect(() => {
    console.log(user)
    if (user?.address) validateWalletAndGithub()

    if (!user?.address && BeproService.isStarted && !BeproService.isLoggedIn) {
      BeproService.login().then(() => {
        setUser(previousUser => ({
          ...previousUser,
          address: BeproService.address
        }))
      }).catch(console.log)
    }
  }, [user, BeproService.isStarted])
  // Side effects needed to the context work

  const memorized = useMemo<IAuthenticationContext>(
    () => ({
      user,
      isGithubAndWalletMatched,
      login,
      validateWalletAndGithub
    }),
    []
  )

  return (
    <AuthenticationContext.Provider value={memorized}>
      <InvalidAccountWalletModal isVisible={isGithubAndWalletMatched === false} user={user} />
      {children}
    </AuthenticationContext.Provider>
  )
}

export const useAuthentication = (): IAuthenticationContext => {
  const context = useContext(AuthenticationContext)

  if (!context) {
    throw new Error(
      'useAuthentication must be used within an AuthenticationProvider'
    )
  }

  return context
}
