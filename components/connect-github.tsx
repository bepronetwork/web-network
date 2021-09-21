import GithubImage from './github-image';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useContext, useEffect} from 'react';
import {ApplicationContext} from '@contexts/application';

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
            <Link href="/api/auth/signin" passHref>
              <a className="btn btn-primary btn-sm rounded-pill">connect</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
