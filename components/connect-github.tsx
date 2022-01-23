import GithubImage from './github-image';
import {useContext} from 'react';
import {ApplicationContext} from '@contexts/application';
import {signIn, signOut} from 'next-auth/react';
import useApi from '@x-hooks/use-api';
import { useTranslation } from 'next-i18next';

export default function ConnectGithub() {
  const {state: {currentAddress}} = useContext(ApplicationContext);
  const api = useApi();
  const { t } = useTranslation('common')

  async function clickSignIn() {
    await signOut({redirect: false});
    localStorage.setItem(`lastAddressBeforeConnect`, currentAddress);
    const user = await api.getUserOf(currentAddress);
    return signIn('github', {callbackUrl: `${window.location.protocol}//${window.location.host}/connect-account${!!user ? `?migrate=1` : ``}`})
  }

  return (
    <div className="container-fluid">
      <div className="row mtn-4 mb-2">
        <div className="col text-center px-0">
          <div className="content-wrapper py-3 border-radius-8 bg-dark-gray">
            <GithubImage/> <span className="caption-small mx-3">{t('actions.connect-github')}</span>
              <button className="btn btn-primary text-uppercase" onClick={() => clickSignIn()}>{t('actions.connect')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
