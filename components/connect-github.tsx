import GithubImage from './github-image';
import Link from 'next/link';

export default function ConnectGithub() {
  return (
    <div className="container-fluid">
      <div className="row mtn-4 mb-2">
        <div className="col text-center px-0">
          <div className="content-wrapper py-3 rounded-0">
            <GithubImage/> <span className="mx-3">Connect your GitHub account!</span>
            <Link href="/api/auth/signin">
              <a className="btn btn-primary btn-sm rounded-pill">connect</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
