import Avatar from '@components/avatar';
import metamaskLogo from '@assets/metamask.png';
import Image from 'next/image';
import React, {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {signOut, useSession, signIn, getSession} from 'next-auth/react';
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
import CheckMarkIcon from '@assets/icons/checkmark-icon';
import LockedIcon from '@assets/icons/locked-icon'
import ErrorMarkIcon from '@assets/icons/errormark-icon';
import {changeNetwork} from '@reducers/change-network';
import {NetworkIds} from '@interfaces/enums/network-ids';
import Button from '@components/button';
import useApi from '@x-hooks/use-api';
import { CustomSession } from '@interfaces/custom-session';
import {GetServerSideProps} from 'next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';


export default function ConnectAccount() {
  const {state: {currentAddress}, dispatch} = useContext(ApplicationContext);
  const [lastAddressBeforeConnect, setLastAddressBeforeConnect] = useState(``);
  const [isGhValid, setIsGhValid] = useState(null)
  const [githubLogin, setGithubLogin] = useState(null)
  const [userAcessToken, setUserAcessToken] = useState<string>("")
  const {data: session} = useSession();
  const router = useRouter();
  const { migrate } = router.query;
  const {getUserOf, joinAddressToUser, getUserWith} = useApi();
  const { t } = useTranslation(['common', 'connect-account'])


  function updateLastUsedAddress() {
    dispatch(changeLoadState(false));
    setLastAddressBeforeConnect(localStorage.getItem(`lastAddressBeforeConnect`))
  }

  async function checkAddressVsGh() {
    if (!currentAddress)
      return;

    const user = await getUserWith(githubLogin);

    if (user && user.address && user.address !== currentAddress.toLowerCase()) {
      dispatch(toastError(t('connect-account:errors.migrating-address-not-match', { address: truncateAddress(user.address)}), undefined, {delay: 10000}));
      setIsGhValid(false)
      return;
    }

    getUserOf(currentAddress)
                      .then(user => {
                        setIsGhValid(user && user.githubHandle === (session?.user.name || (session?.user as any)?.login) || true)

                        if (user?.githubLogin)
                          setGithubLogin(user.githubLogin);

                        if (user?.accessToken)
                          setUserAcessToken(user.accessToken)

                        if (!user)
                          return;

                        if (!isGhValid)
                          return;

                        if(user.address === currentAddress )
                          return router.push('/account')
                      })
  }

  function getValidClass() {
    return isGhValid === null ? `` : `border border-${!isGhValid ? `danger` : `success`}`;
  }

  async function joinAddressToGh() {
    dispatch(changeLoadState(true));

    const user = await getUserOf(currentAddress);

    if (user && (user.githubHandle || user.accessToken.toLowerCase() !== userAcessToken.toLowerCase())) {

      dispatch(changeLoadState(false));
      return dispatch(toastError(t('connect-account:errors.migrating-already-happened')));
    }

    joinAddressToUser(session.user.name||githubLogin,{ address: currentAddress.toLowerCase(), migrate: !!migrate })
                      .then((result) => {
                        if (result === true) {
                          dispatch(toastSuccess(t('connect-account:connect-accounts')))
                          dispatch(changeLoadState(false));
                          dispatch(changeGithubHandle(session.user.name||githubLogin))
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
      const chainId = (window as any)?.ethereum?.chainId;
      if (+process.env.NEXT_PUBLIC_NEEDS_CHAIN_ID !== +chainId) {
        dispatch(changeNetwork((NetworkIds[+chainId] || `unknown`)?.toLowerCase()))
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

  function setGhLoginBySession() {
    console.log(`session`, session, githubLogin);
    if((session?.user.name || (session?.user as any)?.login) !== githubLogin){
      setGithubLogin(session?.user?.name || (session?.user as any)?.login)
    }
  }

  useEffect(updateLastUsedAddress, [])
  useEffect(() => { checkAddressVsGh() }, [currentAddress])
  useEffect(setGhLoginBySession,[session])


  return <>
    <div className="banner bg-bepro-blue mb-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 d-flex justify-content-center">
            <h1 className="h2 text-white text-center">{t('connect-account:connect-github-and-wallet')}</h1>
          </div>
        </div>
      </div>
    </div>
    <div className="container connect-account">
      <div className="row justify-content-center">
        <div className="col-md-8 d-flex justify-content-center">
          <div className="content-wrapper mt-up mb-5">
            <strong className="caption-large d-block text-uppercase mb-4">{t('connect-account:connect-to-use')}</strong>
            <div className="row gx-3">
              <div className="col-6">
                <div className={`button-connect border bg-${githubLogin? `dark border-dark`: `black border-black border-primary-hover cursor-pointer`} d-flex justify-content-between p-3 align-items-center`} onClick={connectGithub}>
                  {!githubLogin && <div className="mx-auto d-flex align-items-center"><GithubImage width={15} height={15} opacity={1}/> <span className="ms-2 text-uppercase caption-large">{t('misc.github')}</span></div>}
                  {githubLogin && (
                    <>
                    <div><Avatar src={session?.user?.image} userLogin={githubLogin || `null`} /> <span className="ms-2">{session?.user?.name}</span></div>
                    <CheckMarkIcon />
                    </>
                  )}

                </div>
              </div>
              <div className="col-6">
                <div className={`button-connect border bg-${currentAddress ? `dark border-dark` : `black border-black border-primary-hover cursor-pointer`} d-flex justify-content-between p-3 align-items-center ${getValidClass()}`} onClick={connectWallet}>
                  {!currentAddress && <div className="mx-auto d-flex align-items-center">{renderMetamaskLogo()} <span className="ms-2 text-uppercase caption-large">{t('misc.metamask')}</span></div>}
                  {currentAddress && (
                    <>
                    <div>{renderMetamaskLogo()} <span className="ms-2">{currentAddress && truncateAddress(currentAddress) || t('actions.connect-wallet')}</span></div>
                    {isGhValid ? <CheckMarkIcon /> : <ErrorMarkIcon/>}
                    </>
                    )}

                </div>
              </div>
            </div>
            <div className="caption-small text-ligth-gray text-center fs-smallest text-dark text-uppercase mt-4">
              {t('misc.by-connecting')} <a href="https://www.bepro.network/terms-and-conditions" target="_blank" className="text-decoration-none">{t('misc.terms-and-conditions')}</a> & <a href="https://www.bepro.network/privacy" target="_blank" className="text-decoration-none">{t('misc.privacy-policy')}</a>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <Button
                className='me-3'
                disabled={!isGhValid}
                onClick={joinAddressToGh}>
                {!isGhValid && <LockedIcon  className="mr-1" width={14} height={14}/>}
                {t('actions.done')}
              </Button>
              <Button color='dark-gray'
                      onClick={cancelAndSignOut}>
                {t('actions.cancel')}
              </Button>

            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'connect-account'])),
    },
  };
};
