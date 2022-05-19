import {
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext
} from "react";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

import InvalidAccountWalletModal from "components/invalid-account-wallet-modal";

import { useDAO } from "contexts/dao";

import { User, Wallet } from "interfaces/authentication";

import useApi from "x-hooks/use-api";
import useNetworkTheme from "x-hooks/use-network";

export interface IAuthenticationContext {
  user?: User;
  wallet?: Wallet;
  isGithubAndWalletMatched?: boolean;
  login: () => void;
  updateWalletBalance: () => void;
}

const AuthenticationContext = createContext<IAuthenticationContext>({} as IAuthenticationContext);

const EXCLUDED_PAGES = ["/networks", "/[network]/connect-account"];

export const AuthenticationProvider = ({ children }) => {
  const session = useSession();
  const { push, asPath, pathname } = useRouter();

  const [user, setUser] = useState<User>();
  const [wallet, setWallet] = useState<Wallet>();
  const [isGithubAndWalletMatched, setIsGithubAndWalletMatched] = useState<boolean>();

  const { service: DAOService } = useDAO();
  const { getUserOf } = useApi();
  const { getURLWithNetwork } = useNetworkTheme();

  const login = useCallback(async () => {
    try {
      if (!DAOService) return;

      await signOut({ redirect: false });

      await DAOService.connect();

      const address = await DAOService.getAddress();

      const isCouncil = await DAOService.isCouncil(address);

      setWallet((previousWallet) => ({
        ...previousWallet,
        isCouncil,
        address
      }));

      const savedUser = await getUserOf(address);

      if (!savedUser) return push(getURLWithNetwork("/connect-account"));

      return signIn("github", {
        callbackUrl: `${window.location.protocol}//${window.location.host}/${asPath}`
      });
    } catch (error) {
      console.log("Failed to login", error);
    }
  }, [asPath, DAOService]);

  const validateWalletAndGithub = useCallback((address: string) => {
    if(!address) return setIsGithubAndWalletMatched(false);
    getUserOf(address)
        .then(async (data) => {
          if (!data) {
            await signOut({ redirect: false });

            push(getURLWithNetwork("/connect-account"));
          } else if (data?.githubLogin === user.login)
            setIsGithubAndWalletMatched(true);
          else setIsGithubAndWalletMatched(false);
        })
        .catch((error) => {
          setIsGithubAndWalletMatched(false);
          console.log(error);
        });
  },
    [user]);

  const updateWalletBalance = useCallback(async () => {
    if (!DAOService || !wallet?.address) return;

    const [
      oracles,
      bepro,
      eth,
      staked,
      isCouncil,
    ] = await Promise.all([
      DAOService.getOraclesResume(wallet.address),
      DAOService.getBalance("settler", wallet.address),
      DAOService.getBalance("eth", wallet.address),
      DAOService.getBalance("staked", wallet.address),
      DAOService.isCouncil(wallet.address),
    ])
    setWallet((previousWallet) => ({
      ...previousWallet,
      isCouncil,
      balance: {
        ...previousWallet.balance,
        oracles,
        bepro,
        eth,
        staked,
      }}))
  }, [wallet?.address, DAOService]);

  // Side effects needed to the context work
  useEffect(() => {
    if (session.status === "authenticated") setUser({ ...session.data.user });
    else if (session.status === "unauthenticated") setUser(undefined);
  }, [session]);

  useEffect(() => {
    if (
      user &&
      wallet &&
      isGithubAndWalletMatched === undefined &&
      !EXCLUDED_PAGES.includes(String(pathname))
    )
      validateWalletAndGithub(wallet?.address);

    if (user && !wallet && DAOService)
      DAOService.connect()
        .then(async() => {
          const address = await DAOService.getAddress();
          const isCouncil = await DAOService.isCouncil(address);

          setWallet((previousWallet) => ({
            ...previousWallet,
            isCouncil,
            address
          }))})
        .catch(console.log);
  }, [user, wallet, DAOService]);

  useEffect(() => {
    if (wallet && wallet?.address) updateWalletBalance();
  }, [pathname, wallet?.address]);
  
  const memorized = useMemo<IAuthenticationContext>(() => ({
      user,
      wallet,
      isGithubAndWalletMatched,
      login,
      updateWalletBalance
  }),
    [user, wallet, isGithubAndWalletMatched, DAOService]);

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
  );
};

export const useAuthentication = (): IAuthenticationContext => {
  const context = useContext(AuthenticationContext);

  if (!context) {
    throw new Error("useAuthentication must be used within an AuthenticationProvider");
  }

  return context;
};
