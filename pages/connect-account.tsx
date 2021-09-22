import Avatar from '@components/avatar';
import metamaskLogo from '@assets/metamask.png';
import Image from 'next/image';
import React, {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {getSession, signOut, useSession} from 'next-auth/react';
import GithubMicroService from '@services/github-microservice';
import {changeGithubHandle} from '@reducers/change-github-handle';
import {changeGithubLogin} from '@reducers/change-github-login';
import {changeLoadState} from '@reducers/change-load-state';
import {toastError, toastSuccess} from '@reducers/add-toast';
import {useRouter} from 'next/router';
import {truncateAddress} from '@helpers/truncate-address';

export default function ConnectAccount() {
  const {state: {currentAddress}, dispatch} = useContext(ApplicationContext);
  const [lastAddressBeforeConnect, setLastAddressBeforeConnect] = useState(``);
  const [isGhValid, setIsGhValid] = useState(null)
  const [connectedAddressValid, setConnectedAddressValid] = useState(null)
  const [githubHandle, setGithubHandle] = useState(null)
  const [githubLogin, setGithubLogin] = useState(null)
  const {data: session, status} = useSession();
  const router = useRouter();

  function updateLastUsedAddress() {
    setLastAddressBeforeConnect(localStorage.getItem(`lastAddressBeforeConnect`))
  }

  function checkAddressVsGh() {
    if (!currentAddress)
      return;

    GithubMicroService.getUserOf(currentAddress)
                      .then(user => {

                        console.log(user, session?.user.name)

                        setIsGhValid(user && user.githubHandle === session?.user.name || true)

                        if (!user)
                          return;

                        if (!isGhValid)
                          return;

                        if (user.githubHandle)
                          setGithubHandle(user.githubHandle);
                        if (user.githubLogin)
                          setGithubLogin(user.githubLogin);
                      })
  }

  function getValidClass() {
    return (isGhValid === null || connectedAddressValid === null) ? `` : `border border-${!(isGhValid && connectedAddressValid) ? `danger` : `success`}`;
  }

  function checkAddressVsLast() {
    setConnectedAddressValid(lastAddressBeforeConnect.toLowerCase() === currentAddress.toLowerCase())
  }

  function joinAddressToGh() {
    dispatch(changeLoadState(true));
    GithubMicroService.joinAddressToUser(session.user.name,{ address: currentAddress})
                      .then((sucess) => {
                        if (sucess) {
                          dispatch(toastSuccess(`Connected accounts!`))
                          dispatch(changeLoadState(false));
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

  useEffect(updateLastUsedAddress, [])

  useEffect(() => {
    checkAddressVsLast()
    checkAddressVsGh()
  }, [currentAddress])

  useEffect(() => {
    console.log(`Session`, session, status)
  }, [session])

  return <>
    <div className="banner bg-bepro-blue mb-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 d-flex justify-content-center">
            <h1>Connect accounts {isGhValid?.toString()} {connectedAddressValid?.toString()}</h1>
          </div>
        </div>
      </div>
    </div>
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8 d-flex justify-content-center">
          <div className="content-wrapper mt-up mb-5">
            <strong className="d-block text-uppercase mb-4">To access and use our network please connect your github account and web3 wallet</strong>
            <div className="row gx-3">
              <div className="col-6">
                <div className={`bg-dark rounded d-flex justify-content-between p-3 ${getValidClass()}`}>
                  <Avatar userLogin={githubLogin || session?.user?.name} /> {session?.user?.name}
                </div>
              </div>
              <div className="col-6">
                <div className={`bg-dark rounded d-flex justify-content-between p-3 ${getValidClass()}`}>
                  <Image src={metamaskLogo} width={28} height={28}/> {truncateAddress(lastAddressBeforeConnect) || truncateAddress(currentAddress) || `Waiting`}
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center align-items-center mt-4">
              in order to continue we need you to connect {lastAddressBeforeConnect ? `your metamask wallet ${truncateAddress(lastAddressBeforeConnect)}` : `a wallet` } with your github account
            </div>
            <div className="text-center fs-smallest text-dark text-uppercase mt-4">
              By connecting, you accept Terms of Service <a href="https://www.bepro.network/terms-and-conditions" className="text-decoration-none">Terms & Conditions</a>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <button className="btn btn-md btn-primary me-3"
                      disabled={!(isGhValid && connectedAddressValid)}
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
