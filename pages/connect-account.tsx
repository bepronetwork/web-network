import Avatar from '@components/avatar';
import metamaskLogo from '@assets/metamask.png';
import Image from 'next/image';
import React, {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {signOut, useSession, signIn} from 'next-auth/react';
import GithubMicroService from '@services/github-microservice';
import {changeGithubHandle} from '@reducers/change-github-handle';
import {changeGithubLogin} from '@reducers/change-github-login';
import GithubImage from '@components/github-image';
import {changeLoadState} from '@reducers/change-load-state';
import {toastError, toastSuccess} from '@reducers/add-toast';
import {useRouter} from 'next/router';
import {truncateAddress} from '@helpers/truncate-address';
import {BeproService} from '@services/bepro-service';
import {changeWalletState} from '@reducers/change-wallet-connect';
import {changeCurrentAddress} from '@reducers/change-current-address';
import ConnectWalletButton from '@components/connect-wallet-button';
import CheckMarkIcon from '@assets/icons/checkmark-icon';
import LockIcon from '@assets/icons/lock';
import ErrorMarkIcon from '@assets/icons/errormark-icon';
import {changeNetwork} from '@reducers/change-network';
import {NetworkIds} from '@interfaces/enums/network-ids';


export default function ConnectAccount() {
  const {state: {currentAddress}, dispatch} = useContext(ApplicationContext);
  const [lastAddressBeforeConnect, setLastAddressBeforeConnect] = useState(``);
  const [isGhValid, setIsGhValid] = useState(null)
  const [githubLogin, setGithubLogin] = useState(null)
  const {data: session} = useSession();
  const router = useRouter();


  function updateLastUsedAddress() {
    setLastAddressBeforeConnect(localStorage.getItem(`lastAddressBeforeConnect`))
  }

  function checkAddressVsGh() {
    if (!currentAddress)
      return;

    GithubMicroService.getUserOf(currentAddress)
                      .then(user => {
                        setIsGhValid(user && user.githubHandle === session?.user.name || true)

                        if (!user)
                          return;

                        if (!isGhValid)
                          return;

                        if(user.address === currentAddress )
                          return router.push('/account')

                        if (user.githubLogin)
                          setGithubLogin(user.githubLogin);
                      })
  }

  function getValidClass() {
    return isGhValid === null ? `` : `border border-${!isGhValid ? `danger` : `success`}`;
  }

  function joinAddressToGh() {
    dispatch(changeLoadState(true));
    GithubMicroService.joinAddressToUser(session.user.name,{ address: currentAddress.toLowerCase() })
                      .then((result) => {
                        if (result === true) {
                          dispatch(toastSuccess(`Connected accounts!`))
                          dispatch(changeLoadState(false));
                          dispatch(changeGithubHandle(session.user.name))
                          dispatch(changeGithubLogin(githubLogin))
                          return router.push(`/account`)
                        }

                        dispatch(toastError(result as unknown as string));
                        dispatch(changeLoadState(false));
                      });
  }

  function cancelAndSignOut() {
    dispatch(changeGithubHandle(``));
    dispatch(changeGithubLogin(``));
    return signOut({redirect: false})
      .then(() => router.push(`/`));
  }

  async function connectWallet() {
    if (currentAddress)
      return;

    let loggedIn = false;

    try {
      const chainId = (window as any).web3?.currentProvider?.chainId;
      if (+process.env.NEXT_PUBLIC_NEEDS_CHAIN_ID !== +chainId) {
        dispatch(changeNetwork(NetworkIds[+chainId]?.toLowerCase()))
        return;
      } else loggedIn = await BeproService.login();
    } catch (e) {
      console.error(`Failed to login on BeproService`, e);
    }

    if (!loggedIn) {
      dispatch(changeWalletState(false))
      dispatch(changeCurrentAddress(``));
    } else {
      dispatch(changeWalletState(loggedIn))
      dispatch(changeCurrentAddress(BeproService.address));
    }

    return loggedIn;
  }

  function connectGithub(){
    localStorage.setItem(`lastAddressBeforeConnect`, currentAddress);
    return signIn('github', {callbackUrl: `${window.location.protocol}//${window.location.host}/connect-account`})
  }

  function renderMetamaskLogo() {
    return <Image src={metamaskLogo} width={15} height={15}/>;
  }
  function setGhLoginBySession(){
    if(session?.user.name !== githubLogin){
      setGithubLogin(session?.user?.name)
    }
  }
  useEffect(updateLastUsedAddress, [])
  useEffect(checkAddressVsGh, [currentAddress])
  useEffect(setGhLoginBySession,[session])


  return <>
    <div className="banner bg-bepro-blue mb-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 d-flex justify-content-center">
            <h1 className="h2 text-white text-center">Connect your GitHub account and MetaMask wallet</h1>
          </div>
        </div>
      </div>
    </div>
    <div className="container connect-account">
      <div className="row justify-content-center">
        <div className="col-md-8 d-flex justify-content-center">
          <div className="content-wrapper mt-up mb-5">
            <strong className="capition d-block text-uppercase mb-4">To access and use our network please connect your github account and web3 wallet</strong>
            <div className="row gx-3">
              <div className="col-6">
                <div className={`button-connect border bg-${githubLogin? `dark border-dark`: `black border-black border-primary-hover cursor-pointer`} rounded d-flex justify-content-between p-3 align-items-center`} onClick={connectGithub}>
                  {!githubLogin && <div className="mx-auto d-flex align-items-center text-uppercase smallCaption"><GithubImage width={15} height={15} opacity={1}/> <span className="ms-2">github</span></div>}
                  {githubLogin && (
                    <>
                    <div><Avatar userLogin={githubLogin || `null`} /> <span className="ms-2">{session?.user?.name}</span></div>
                    <CheckMarkIcon />
                    </>
                  )}

                </div>
              </div>
              <div className="col-6">
                <div className={`button-connect border bg-${currentAddress ? `dark border-dark` : `black border-black border-primary-hover cursor-pointer`} rounded d-flex justify-content-between p-3 align-items-center ${getValidClass()}`} onClick={connectWallet}>
                  {!currentAddress && <div className="mx-auto d-flex align-items-center text-uppercase smallCaption">{renderMetamaskLogo()} <span className="ms-2">metamask</span></div>}
                  {currentAddress && (
                    <>
                    <div>{renderMetamaskLogo()} <span className="ms-2">{currentAddress && truncateAddress(currentAddress) || `Connect wallet`}</span></div>
                    {isGhValid ? <CheckMarkIcon /> : <ErrorMarkIcon/>}
                    </>
                    )}

                </div>
              </div>
            </div>
            <div className="smallCaption text-ligth-gray text-center fs-smallest text-dark text-uppercase mt-4">
              By connecting, you accept <a href="https://www.bepro.network/terms-and-conditions" target="_blank" className="text-decoration-none">Terms & Conditions</a> & <a href="https://www.bepro.network/private-policy" target="_blank" className="text-decoration-none">PRIVACY POLICY</a>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <button className="btn btn-md p-3 btn-primary me-3 text-uppercase text-center
              d-flex align-items-center justify-content-between"
                      disabled={!isGhValid}
                      onClick={joinAddressToGh}>
                <span className="mr-1">{!isGhValid && <LockIcon/>}</span>
                DONE
              </button>

              <button className="btn btn-md p-3 btn-opac text-uppercase text-white"
                      onClick={cancelAndSignOut}>
                CANCEL
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}
