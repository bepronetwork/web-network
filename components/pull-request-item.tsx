import Link from 'next/link'
import Button from './button'
import { formatDate } from '@helpers/formatDate'
import Avatar from './avatar'
import LockedIcon from '@assets/icons/locked-icon'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import { ApplicationContext } from '@contexts/application'

export default function PullRequestItem({
  repoId,
  issueId,
  pullRequest
}) {
  const router = useRouter()
  const {
    state: { currentAddress, githubLogin }
  } = useContext(ApplicationContext)

  function handleReviewClick() {
    router.push({
      pathname: '/pull-request',
      query: { repoId, issueId, prId: pullRequest.githubId, review: true }
    })
  }

  function canReview() {
    return pullRequest?.state === 'open' && !!githubLogin
  }

  return (
    <>
      <div className="content-list-item proposal">
        <Link
          passHref
          href={{
            pathname: '/pull-request',
            query: { repoId, issueId, prId: pullRequest.githubId }
          }}
        >
          <a className="text-decoration-none text-white">
            <div className="row align-items-center pl-1 pr-1">
              <div className="col-7 caption-small text-uppercase text-white">
                <Avatar userLogin={pullRequest?.githubLogin} />
                <span className="ml-2">
                  #{pullRequest?.githubId} BY @{pullRequest?.githubLogin}
                </span>
              </div>

              <div className="col-2 caption-small text-uppercase text-white d-flex justify-content-center">
                {formatDate(pullRequest?.createdAt)}
              </div>

              <div className="col-2 caption-small text-uppercase text-white d-flex justify-content-center">
                {pullRequest?.comments?.length} Review
                {(pullRequest?.comments?.length !== 1 && 's') || ''}
              </div>

              <div className="col-1 d-flex justify-content-center">
                <Button
                  disabled={!canReview()}
                  onClick={(ev) => {
                    ev.preventDefault()
                    handleReviewClick()
                  }}
                >
                  {!canReview() && <LockedIcon className="me-2" />}
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
