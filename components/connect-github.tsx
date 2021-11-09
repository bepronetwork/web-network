import GithubImage from './github-image';
import {useContext} from 'react';
import {ApplicationContext} from '@contexts/application';
import {signIn, signOut} from 'next-auth/react';
import useApi from '@x-hooks/use-api';

export default function ConnectGithub() {
  const {state: {currentAddress}} = useContext(ApplicationContext);
  const api = useApi();

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
          <div className="content-wrapper py-3 rounded-0">
            <GithubImage/> <span className="mx-3">Connect your GitHub account!</span>
              <button className="btn btn-primary text-uppercase" onClick={() => clickSignIn()}>connect</button>
          </div>
        </div>
      </div>
    </div>
  )
}
