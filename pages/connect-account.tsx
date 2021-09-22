import Avatar from '@components/avatar';
import metamaskLogo from '@assets/metamask.png';
import Image from 'next/image';
import React, {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {signOut, useSession} from 'next-auth/react';
import GithubMicroService from '@services/github-microservice';
import {changeGithubHandle} from '@reducers/change-github-handle';
import {changeGithubLogin} from '@reducers/change-github-login';
import {changeLoadState} from '@reducers/change-load-state';
import {toastError, toastSuccess} from '@reducers/add-toast';
import {useRouter} from 'next/router';
import {truncateAddress} from '@helpers/truncate-address';
import {BeproService} from '@services/bepro-service';
import {changeWalletState} from '@reducers/change-wallet-connect';
import {changeCurrentAddress} from '@reducers/change-current-address';
import ConnectWalletButton from '@components/connect-wallet-button';
import CheckMarkIcon from '@assets/icons/checkmark-icon';

export default function ConnectAccount() {
  const {state: {currentAddress}, dispatch} = useContext(ApplicationContext);
  const [lastAddressBeforeConnect, setLastAddressBeforeConnect] = useState(``);
  const [isGhValid, setIsGhValid] = useState(null)
  const [githubLogin, setGithubLogin] = useState(null)
  const {data: session,} = useSession();
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
                      .then((sucess) => {
                        if (sucess) {
                          dispatch(toastSuccess(`Connected accounts!`))
                          dispatch(changeLoadState(false));
                          dispatch(changeGithubHandle(session.user.name))
                          dispatch(changeGithubLogin(githubLogin))
                          return router.push(`/account`)
                        }

                        dispatch(toastError(`Failed to join accounted on GH level`));
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
      loggedIn = await BeproService.login();
    } catch (e) {
      console.log(e);
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

  function renderMetamaskLogo() {
    return <Image src={metamaskLogo} width={28} height={28}/>;
  }

  useEffect(updateLastUsedAddress, [])
  useEffect(checkAddressVsGh, [currentAddress])


  return <>
    <div className="banner bg-bepro-blue mb-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 d-flex justify-content-center">
            <h1>Connect accounts</h1>
          </div>
        </div>
      </div>
    </div>
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8 d-flex justify-content-center">
          <div className="content-wrapper mt-up mb-5">
            <strong className="d-block text-uppercase mb-4">To access and use our network please connect your github account to a web3 wallet</strong>
            <div className="row gx-3">
              <div className="col-6">
                <div className={`bg-dark border border-dark rounded d-flex justify-content-between align-items-center p-3 ${getValidClass()}`}>
                  <div><Avatar userLogin={githubLogin || session?.user?.name || `null`} /> <span className="ms-2">{session?.user?.name}</span></div>
                  {githubLogin || session?.user?.name && <CheckMarkIcon /> || ``}
                </div>
              </div>
              <div className="col-6">
                <div className={`border bg-${currentAddress ? `dark border-dark` : `black border-black border-primary-hover cursor-pointer`} rounded d-flex justify-content-between p-3 align-items-center ${getValidClass()}`} onClick={connectWallet}>
                  {!currentAddress && <div className="mx-auto d-flex align-items-center text-uppercase smallCaption">{renderMetamaskLogo()} <span className="ms-2">metamask</span></div>}
                  {currentAddress && <div className="d-flex w-100 justify-content-between">{renderMetamaskLogo()} <span className="ms-auto">{currentAddress && truncateAddress(currentAddress) || `Connect wallet`}</span></div> }
                </div>
              </div>
            </div>
            <div className="text-center fs-smallest text-dark text-uppercase mt-4">
              By connecting, you accept Terms of Service <a href="https://www.bepro.network/terms-and-conditions" target="_blank" className="text-decoration-none">Terms & Conditions</a>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <button className="btn btn-md btn-primary me-3"
                      disabled={!isGhValid}
                      onClick={joinAddressToGh}>
                Connect accounts
              </button>

              <button className="btn btn-md btn-primary"
                      onClick={cancelAndSignOut}>
                Cancel
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}
