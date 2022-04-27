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

import { changeOraclesParse } from "contexts/reducers/change-oracles";

import { IUser } from "interfaces/authentication";
import { IWallet } from "interfaces/authentication";

import { BeproService } from "services/bepro-service";

import useApi from "x-hooks/use-api";
import useNetworkTheme from "x-hooks/use-network";

export interface IAuthenticationContext {
  user?: IUser;
  wallet?: IWallet;
  isGithubAndWalletMatched?: boolean;
  beproServiceStarted?: boolean;
  login: () => void;
  updateWalletBalance: () => void;
  updateIsApprovedSettlerToken: () => void;
}

const AuthenticationContext = createContext<IAuthenticationContext>({} as IAuthenticationContext);

const EXCLUDED_PAGES = ["/networks", "/[network]/connect-account"];

export const AuthenticationProvider = ({ children }) => {
  const session = useSession();
  const { push, asPath, pathname } = useRouter();

  const [user, setUser] = useState<IUser>();
  const [wallet, setWallet] = useState<IWallet>();
  const [beproServiceStarted, setBeproServiceStarted] = useState(false);
  const [isGithubAndWalletMatched, setIsGithubAndWalletMatched] =
    useState<boolean>();

  const { getUserOf } = useApi();
  const { getURLWithNetwork } = useNetworkTheme();

  const login = useCallback(async () => {
    if (!BeproService.isStarted) return;

    try {
      await signOut({ redirect: false });

      await BeproService.login();

      const [isCouncil, isApprovedSettlerToken] = await Promise.all([
        BeproService.network.isCouncil(BeproService?.address),
        BeproService.isApprovedSettlerToken()
      ])

      setWallet((previousWallet) => ({
        ...previousWallet,
        isApprovedSettlerToken,
        isCouncil,
        address: BeproService?.address
      }));

      const savedUser = await getUserOf(BeproService?.address);

      if (!savedUser) return push(getURLWithNetwork("/connect-account"));

      return signIn("github", {
        callbackUrl: `${window.location.protocol}//${window.location.host}/${asPath}`
      });
    } catch (error) {
      console.log("Failed to login", error);
    }
  }, [asPath]);

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
    const [
      oracles,
      bepro,
      eth,
      staked,
      isCouncil,
    ] = await Promise.all([
      BeproService.getOraclesSummary(),
      BeproService.getBalance("bepro"),
      BeproService.getBalance("eth"),
      BeproService.getBalance("staked"),
      BeproService.network.isCouncil(BeproService.address),
    ])
    setWallet((previousWallet) => ({
      ...previousWallet,
      isCouncil,
      balance: {
        ...previousWallet.balance,
        oracles: changeOraclesParse(BeproService.address, oracles),
        bepro,
        eth,
        staked,
      }}))
  }, []);

  const updateIsApprovedSettlerToken = useCallback(async ()=>{
    const [isApprovedSettlerToken] = await Promise.all([
      BeproService.isApprovedSettlerToken()
    ])
    setWallet(previousWallet =>({
      ...previousWallet,
      isApprovedSettlerToken
    }))
  },[wallet])

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

    if (user && !wallet && beproServiceStarted)
      BeproService.login()
        .then(async() =>{
          const [isCouncil, isApprovedSettlerToken] = await Promise.all([
            BeproService.network.isCouncil(BeproService?.address),
            BeproService.isApprovedSettlerToken()
          ])
          setWallet((previousWallet) => ({
            ...previousWallet,
            isCouncil,
            isApprovedSettlerToken,
            address: BeproService?.address
          }))})
        .catch(console.log);
  }, [user, wallet, beproServiceStarted]);

  useEffect(() => {
    if (wallet && wallet?.address && beproServiceStarted) updateWalletBalance();
  }, [pathname, wallet?.address]);

  useEffect(() => {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (BeproService.isStarted){
        const address = accounts[0];
        BeproService.login()
        .then(async () =>{
          const [isCouncil, isApprovedSettlerToken] = await Promise.all([
            BeproService.network.isCouncil(address),
            BeproService.isApprovedSettlerToken()
          ])
          setWallet({ address, isCouncil, isApprovedSettlerToken })
        });
      }
    });
  }, []);

  useEffect(() => {
    const checkBeproServiceStarted = setInterval(() => {
      if (BeproService.isStarted) {
        setBeproServiceStarted(true);
        clearInterval(checkBeproServiceStarted);
      }
    }, 1000);

    return () => {
      clearInterval(checkBeproServiceStarted);
    };
  }, []);

  // useEffect(() => {
  //   console.table({wallet, user})
  // }, [wallet, user]);
  
  const memorized = useMemo<IAuthenticationContext>(() => ({
      user,
      wallet,
      beproServiceStarted,
      isGithubAndWalletMatched,
      login,
      updateWalletBalance,
      updateIsApprovedSettlerToken
  }),
    [user, wallet, beproServiceStarted, isGithubAndWalletMatched]);

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
