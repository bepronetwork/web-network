import GithubImage from './github-image';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useContext, useEffect} from 'react';
import {ApplicationContext} from '@contexts/application';
import {signIn} from 'next-auth/react';

export default function ConnectGithub() {
  const {state: {currentAddress}} = useContext(ApplicationContext);

  useEffect(() => {
    localStorage.setItem(`lastAddressBeforeConnect`, currentAddress);
  }, [currentAddress])

  return (
    <div className="container-fluid">
      <div className="row mtn-4 mb-2">
        <div className="col text-center px-0">
          <div className="content-wrapper py-3 rounded-0">
            <GithubImage/> <span className="mx-3">Connect your GitHub account!</span>
              <button className="btn btn-primary btn-sm rounded-pill" onClick={() => signIn('github', {callbackUrl: `http://localhost:3000/connect-account`})}>connect</button>
          </div>
        </div>
      </div>
    </div>
  )
}
