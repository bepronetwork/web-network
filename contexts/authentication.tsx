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

import { changeOraclesParse } from '@contexts/reducers/change-oracles'

import { IUser } from '@interfaces/authentication'
import { IWallet } from '@interfaces/authentication'

import { BeproService } from '@services/bepro-service'

import useApi from '@x-hooks/use-api'
import useNetworkTheme from '@x-hooks/use-network'

export interface IAuthenticationContext {
  user?: IUser
  wallet?: IWallet
  isGithubAndWalletMatched?: boolean
  beproServiceStarted?: boolean
  login: () => void
  updateWalletBalance: () => void
}

const AuthenticationContext = createContext<IAuthenticationContext>(
  {} as IAuthenticationContext
)

const EXCLUDED_PAGES = ['/networks', '/[network]/connect-account']

export const AuthenticationProvider = ({ children }) => {
  const session = useSession()
  const { push, asPath, pathname } = useRouter()

  const [user, setUser] = useState<IUser>()
  const [wallet, setWallet] = useState<IWallet>()
  const [beproServiceStarted, setBeproServiceStarted] = useState(false)
  const [isGithubAndWalletMatched, setIsGithubAndWalletMatched] =
    useState<boolean>()

  const { getUserOf } = useApi()
  const { getURLWithNetwork } = useNetworkTheme()

  const login = useCallback(async () => {
    if (!BeproService.isStarted) return

    try {
      await signOut({ redirect: false })

      await BeproService.login()

      setWallet((previousWallet) => ({
        ...previousWallet,
        address: BeproService.address
      }))

      const savedUser = await getUserOf(BeproService.address)

      if (!savedUser) return push(getURLWithNetwork('/connect-account'))

      return signIn('github', {
        callbackUrl: `${window.location.protocol}//${window.location.host}/${asPath}`
      })
    } catch (error) {
      console.log('Failed to login', error)
    }
  }, [asPath])

  const validateWalletAndGithub = useCallback(
    (address: string) => {
      getUserOf(address)
        .then(async (data) => {
          if (!data) {
            await signOut({ redirect: false })

            push(getURLWithNetwork('/connect-account'))
          } else if (data?.githubLogin === user.login)
            setIsGithubAndWalletMatched(true)
          else setIsGithubAndWalletMatched(false)
        })
        .catch((error) => {
          setIsGithubAndWalletMatched(false)
          console.log(error)
        })
    },
    [user]
  )

  const updateWalletBalance = useCallback(() => {
    BeproService.getOraclesSummary().then((oracles) =>
      setWallet((previousWallet) => ({
        ...previousWallet,
        balance: {
          ...previousWallet.balance,
          oracles: changeOraclesParse(previousWallet.address, oracles)
        }
      }))
    )

    BeproService.getBalance('bepro').then((bepro) =>
      setWallet((previousWallet) => ({
        ...previousWallet,
        balance: {
          ...previousWallet.balance,
          bepro
        }
      }))
    )

    BeproService.getBalance('eth').then((eth) =>
      setWallet((previousWallet) => ({
        ...previousWallet,
        balance: {
          ...previousWallet.balance,
          eth
        }
      }))
    )

    BeproService.getBalance('staked').then((staked) =>
      setWallet((previousWallet) => ({
        ...previousWallet,
        balance: {
          ...previousWallet.balance,
          staked
        }
      }))
    )
  }, [wallet?.address])

  // Side effects needed to the context work
  useEffect(() => {
    if (session.status === 'authenticated') setUser({ ...session.data.user })
  }, [session])

  useEffect(() => {
    console.log('user', user)
    console.log('wallet', wallet)

    if (
      user &&
      wallet &&
      isGithubAndWalletMatched === undefined &&
      !EXCLUDED_PAGES.includes(String(pathname))
    )
      validateWalletAndGithub(wallet.address)

    if (user && !wallet && beproServiceStarted)
      BeproService.login()
        .then(() =>
          setWallet((previousWallet) => ({
            ...previousWallet,
            address: BeproService.address
          }))
        )
        .catch(console.log)
  }, [user, wallet, beproServiceStarted])

  useEffect(() => {
    if (wallet && wallet?.address && beproServiceStarted) {
      setIsGithubAndWalletMatched(undefined)
      updateWalletBalance()
    }
  }, [wallet?.address, beproServiceStarted])

  useEffect(() => {
    if (wallet && wallet?.address && beproServiceStarted) updateWalletBalance()
  }, [pathname, beproServiceStarted])

  useEffect(() => {
    window.ethereum.on(`accountsChanged`, (accounts) => {
      if (BeproService.isStarted)
        BeproService.login().then(() => setWallet({ address: accounts[0] }))
    })
  }, [])

  useEffect(() => {
    const checkBeproServiceStarted = setInterval(() => {
      if (BeproService.isStarted) {
        setBeproServiceStarted(true)
        clearInterval(checkBeproServiceStarted)
      }
    }, 1000)

    return () => {
      clearInterval(checkBeproServiceStarted)
    }
  }, [])
  // Side effects needed to the context work

  const memorized = useMemo<IAuthenticationContext>(
    () => ({
      user,
      wallet,
      beproServiceStarted,
      isGithubAndWalletMatched,
      login,
      updateWalletBalance
    }),
    [user, wallet, beproServiceStarted, isGithubAndWalletMatched]
  )

  return (
    <AuthenticationContext.Provider value={memorized}>
      <InvalidAccountWalletModal
        user={user}
        wallet={wallet}
        isVisible={
          isGithubAndWalletMatched === false &&
          !EXCLUDED_PAGES.includes(String(pathname))
        }
      />
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
