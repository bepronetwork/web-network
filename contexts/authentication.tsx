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

import { User as UserApi } from "interfaces/api";
import { User, Wallet } from "interfaces/authentication";
import { CustomSession } from "interfaces/custom-session";

import useApi from "x-hooks/use-api";

export interface IAuthenticationContext {
  user?: User;
  wallet?: Wallet;
  isGithubAndWalletMatched?: boolean;
  isConnecting?:boolean;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  connectGithub: () => void;
  disconnectGithub: () => void;
  updateWalletBalance: () => Promise<void>;
  validateWalletAndGithub: (address: string, login: string) => void;
}

const AuthenticationContext = createContext<IAuthenticationContext>({} as IAuthenticationContext);

const EXCLUDED_PAGES = ["/networks", "/connect-account", "/new-network", "/[network]/profile/my-network"];

export const AuthenticationProvider = ({ children }) => {
  const session = useSession();
  const { asPath, pathname, push } = useRouter();

  const [user, setUser] = useState<User>();
  const [wallet, setWallet] = useState<Wallet>();
  const [databaseUser, setDatabaseUser] = useState<UserApi>();
  const [isGithubAndWalletMatched, setIsGithubAndWalletMatched] = useState<boolean>();

  const [isConnecting, setIsConnecting] = useState<boolean>(false)

  const { getUserOf, getUserWith } = useApi();
  const { service: DAOService, connect } = useDAO();

  const URL_BASE = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "";

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

  
  const disconnectWallet = useCallback(async () => {
    const lastNetwork = localStorage.getItem("lastNetworkVisited");

    localStorage.clear();
    
    setWallet(undefined);

    signOut({
      callbackUrl: `${URL_BASE}/${lastNetwork}`
    });
  }, []);

  const disconnectGithub = () => {
    return signOut({ redirect: false });
  }
  
  const connectGithub = async () => {
    try {

      setIsConnecting(true)
      
      const user = await getUserOf(wallet?.address?.toLowerCase());

      if (!user?.githubLogin && !asPath?.includes("connect-account")) {
        sessionStorage.setItem("lastUrlBeforeGithubConnect", asPath);
        await disconnectGithub();
        return push("/connect-account");
      }

      await disconnectGithub();

      signIn("github", {
      callbackUrl: `${URL_BASE}/${asPath}`
      }) .then(() => {
        sessionStorage.setItem("currentWallet", wallet?.address || "");
      })
    } finally{
      setIsConnecting(false)
    }
  }

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
    if (!address || !login)
      return setIsGithubAndWalletMatched(undefined);

    let databaseUser = login ? await getUserWith(login) : null;

    if (!databaseUser?.address) databaseUser = address ? await getUserOf(address) : null;
    
    if (databaseUser) setDatabaseUser(databaseUser);

    if (!databaseUser?.githubLogin) setIsGithubAndWalletMatched(undefined);
    else if (databaseUser?.githubLogin && login)
      setIsGithubAndWalletMatched(login === databaseUser.githubLogin && 
        (address ? address === databaseUser.address : true));

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

  // Needed side effects for the context to work
  useEffect(() => {
    if (session.status === "authenticated" && !!databaseUser?.githubLogin) 
      setUser({ ...session.data.user });
    else
      setUser(undefined);
  }, [session, databaseUser, pathname]);

  useEffect(() => {
    const login  = user?.login || (session.data as CustomSession)?.user?.login;

    validateWalletAndGithub(wallet?.address.toLowerCase(), login);
  }, [user?.login, session?.data?.user?.name, wallet?.address]);

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
    sessionStorage.setItem("currentWallet", wallet?.address || "");
    updateWalletBalance();
  }, [pathname, wallet?.address]);
  
  const memorized = useMemo<IAuthenticationContext>(() => ({
      user,
      wallet,
      isGithubAndWalletMatched,
      isConnecting,
      connectWallet,
      connectGithub,
      updateWalletBalance,
      disconnectWallet,
      disconnectGithub,
      validateWalletAndGithub
  }),
    [user, wallet, isGithubAndWalletMatched, DAOService, connectGithub, asPath]);

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
