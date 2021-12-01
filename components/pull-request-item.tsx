import Link from 'next/link'
import Button from './button'
import { formatDate } from '@helpers/formatDate'
import Avatar from './avatar'
import LockedIcon from '@assets/icons/locked-icon'

export default function PullRequestItem({ repoId, issueId, canReview = false, pullRequest }) {
  return (
    <>
      <div className="content-list-item proposal">
        <Link passHref href={{ pathname: '/pull-request', query: {repoId, issueId, prId: pullRequest.githubId} }}>
          <a className="text-decoration-none text-white">
            <div className="row align-items-center pl-1 pr-1">
              <div className="col-7 smallCaption text-uppercase text-white">
                <Avatar userLogin={pullRequest?.githubLogin} />
                <span className="ml-2">
                  #{pullRequest?.githubId} BY @{pullRequest?.githubLogin}
                </span>
              </div>

              <div className="col-2 smallCaption text-uppercase text-white d-flex justify-content-center">
                {formatDate(pullRequest?.createdAt)}
              </div>

              <div className="col-2 smallCaption text-uppercase text-white d-flex justify-content-center">
                {pullRequest?.reviews?.length} Review{pullRequest?.reviews?.length !== 1 && 's' || ''}
              </div>

              <div className="col-1 d-flex justify-content-center">
                <Button disabled={!canReview}>
                  {!canReview && <LockedIcon className="me-2" />}
                  <span>Review</span>
                </Button>
              </div>
            </div>
          </a>
        </Link>
      </div>
    </>
  )
}
