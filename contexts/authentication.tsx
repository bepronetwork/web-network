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

  const { getUserOf, getUserWith } = useApi();
  const { getURLWithNetwork } = useNetworkTheme();
  const { service: DAOService, connect } = useDAO();

  const login = useCallback(async () => {
    try {
      if (!user?.login)
        return signIn("github", {
          callbackUrl: `${window.location.protocol}//${window.location.host}/${asPath}`
        });

      if (!DAOService) return;

      await connect();

      await updateWalletAddress();
    } catch (error) {
      console.log("Failed to login", error);
    }
  }, [user?.login, asPath, DAOService]);

  const updateWalletAddress = useCallback(async () => {
    const address = await DAOService.getAddress();

    const isCouncil = await DAOService.isCouncil(address);

    setIsGithubAndWalletMatched(undefined);
    setWallet((previousWallet) => ({
      ...previousWallet,
      isCouncil,
      address
    }));

    return address;
  }, [DAOService]);

  const validateWalletAndGithub = useCallback(async (address: string, login: string) => {
    if (!address && !login) return setIsGithubAndWalletMatched(undefined);

    const userAddress = login ? (await getUserWith(login)).address : undefined;
    const userLogin = address ? (await getUserOf(address)).githubLogin : undefined;

    if (!userAddress && !userLogin) {
      await signOut({ redirect: false });
      setIsGithubAndWalletMatched(undefined);

      push(getURLWithNetwork("/connect-account"));
    } else {
      setIsGithubAndWalletMatched(userLogin === login && userAddress === address);
    }
  }, []);

  const updateWalletBalance = useCallback(async () => {
    if (!DAOService || !wallet?.address) return;

    const [
      oracles,
      bepro,
      eth,
      staked,
      isCouncil,
      isNetworkGovernor
    ] = await Promise.all([
      DAOService.getOraclesResume(wallet.address),
      DAOService.getBalance("settler", wallet.address),
      DAOService.getBalance("eth", wallet.address),
      DAOService.getBalance("staked", wallet.address),
      DAOService.isCouncil(wallet.address),
      DAOService.isNetworkGovernor(wallet.address)
    ])

    setWallet((previousWallet) => ({
      ...previousWallet,
      isCouncil,
      isNetworkGovernor,
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
    if ((user?.login || wallet?.address) && !EXCLUDED_PAGES.includes(String(pathname)))
      validateWalletAndGithub(wallet?.address.toLowerCase(), user?.login);

    if (user && !wallet && DAOService)
      connect()
        .then(() => {
          updateWalletAddress();
        })
        .catch(console.log);
  }, [user?.login, wallet?.address, DAOService]);

  useEffect(() => {
    if (!DAOService) return;
    
    window?.ethereum?.on("accountsChanged", () => {
      DAOService.connect()
        .then(connected => {
          if (connected) updateWalletAddress();
        })
        .catch(error => console.log("Failed to change account", error));
    });
  }, [DAOService]);

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
