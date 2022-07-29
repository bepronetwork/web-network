import {
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext
} from "react";

import { signIn, useSession } from "next-auth/react";
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
  connectWallet: () => Promise<boolean>;
  connectGithub: () => void;
  updateWalletBalance: () => void;
  disconnectWallet: () => void;
}

const AuthenticationContext = createContext<IAuthenticationContext>({} as IAuthenticationContext);

const EXCLUDED_PAGES = ["/networks", "/[network]/connect-account"];

export const AuthenticationProvider = ({ children }) => {
  const session = useSession();
  const { asPath, pathname, push } = useRouter();

  const [user, setUser] = useState<User>();
  const [wallet, setWallet] = useState<Wallet>();
  const [isGithubAndWalletMatched, setIsGithubAndWalletMatched] = useState<boolean>();
  const { getURLWithNetwork } = useNetworkTheme();
  const { getUserOf } = useApi();
  const { service: DAOService, connect } = useDAO();

  const connectWallet = useCallback(async () => {
    try {
      if (!DAOService) return;

      await connect();

      await updateWalletAddress();

      return true;
    } catch (error) {
      console.log("Failed to login", error);
      return false;
    }
  }, [user?.login, asPath, DAOService]);

  const connectGithub = useCallback(async () => {
    const URL_BASE = `${window.location.protocol}//${ window.location.host}`;

    const user = await getUserOf(wallet?.address?.toLowerCase());

    if (!user) return push(getURLWithNetwork("/connect-account"));

    signIn("github", {
      callbackUrl: `${URL_BASE}${asPath}`
    });
  }, [wallet?.address, asPath]);

  const disconnectWallet = useCallback(() => {
    setWallet(undefined);
  }, []);

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
    if (!address || !login || EXCLUDED_PAGES.includes(String(pathname))) 
      return setIsGithubAndWalletMatched(undefined);

    const userLogin = address ? (await getUserOf(address))?.githubLogin : undefined;

    if (login) setIsGithubAndWalletMatched(userLogin === login);
  }, [pathname]);

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
    validateWalletAndGithub(wallet?.address.toLowerCase(), user?.login);
  }, [user?.login, wallet?.address]);

  useEffect(() => {
    if (!DAOService) return;
    
    if (wallet?.address)
      window?.ethereum?.on("accountsChanged", () => {
        DAOService.connect()
          .then(connected => {
            if (connected) updateWalletAddress();
          })
          .catch(error => console.log("Failed to change account", error));
      });
    else
      window?.ethereum?.removeAllListeners("accountsChanged");
  }, [DAOService, wallet?.address]);

  useEffect(() => {
    if (wallet && wallet?.address) updateWalletBalance();
  }, [pathname, wallet?.address]);
  
  const memorized = useMemo<IAuthenticationContext>(() => ({
      user,
      wallet,
      isGithubAndWalletMatched,
      connectWallet,
      connectGithub,
      updateWalletBalance,
      disconnectWallet
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
