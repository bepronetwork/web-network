import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { head } from 'lodash'

import Button from '@components/button'
import Comment from '@components/comment'
import GithubLink from '@components/github-link'
import NothingFound from '@components/nothing-found'
import CustomContainer from '@components/custom-container'
import PullRequestHero from '@components/pull-request-hero'
import CreateReviewModal from '@components/create-review-modal'

import { ApplicationContext } from '@contexts/application'
import { changeLoadState } from '@contexts/reducers/change-load-state'

import useRepos from '@x-hooks/use-repos'
import useMergeData from '@x-hooks/use-merge-data'

import { formatDate } from '@helpers/formatDate'
import { formatNumberToCurrency } from '@helpers/formatNumber'

import { IssueData, pullRequest } from '@interfaces/issue-data'
import LockedIcon from '@assets/icons/locked-icon'

export default function PullRequest() {
  const {
    dispatch,
    state: { loading, githubLogin, currentAddress }
  } = useContext(ApplicationContext)

  const router = useRouter()
  const [[activeRepo]] = useRepos()
  const [issue, setIssue] = useState<IssueData>()
  const [showModal, setShowModal] = useState(false)
  const [pullRequest, setPullRequest] = useState<pullRequest>()
  const { getIssue, getMergedDataFromPullRequests } = useMergeData()

  const { repoId, issueId, prId, review } = router.query

  function loadData() {
    const [repo, githubId] = String(issueId).split('/')

    if (!activeRepo) return

    dispatch(changeLoadState(true))

    getIssue(String(repoId), githubId, activeRepo?.githubPath)
      .then((issue) => {
        setIssue(issue)

        return issue
      })
      .then((issue) =>
        getMergedDataFromPullRequests(
          activeRepo?.githubPath,
          issue.pullRequests.filter((pr) => pr.githubId === prId)
        )
      )
      .then((merged) => setPullRequest(head(merged)))
      .finally(() => dispatch(changeLoadState(false)))
  }

  function renderReviews() {
    return (
      <>
        {pullRequest?.reviews?.map((review) => (
          <Comment
            comment={{
              id: review.id,
              user: review.user,
              body: review.body,
              updated_at: review.submitted_at
            }}
          />
        ))}
      </>
    )
  }

  function handleShowModal() {
    setShowModal(true)
  }

  function handleCloseModal() {
    setShowModal(false)
  }

  useEffect(loadData, [activeRepo, issueId, prId])
  useEffect(() => {
    if (review) setShowModal(true)
  }, [review])

  return (
    <>
      <PullRequestHero
        githubId={issue?.githubId}
        title={issue?.title}
        pullRequestId={prId}
        authorPullRequest={pullRequest?.githubLogin || ''}
        createdAt={pullRequest && formatDate(pullRequest.createdAt)}
        beproStaked={formatNumberToCurrency(issue?.amount)}
      />

      <CustomContainer>
        <div className="row align-items-center bg-shadow border-radius-8 px-3 py-4">
          <div className="col-8">
            <span className="largeCaption text-uppercase">
              {pullRequest?.reviews?.length} Review
              {(pullRequest?.reviews?.length !== 1 && 's') || ''}
            </span>
          </div>

          <div className="col-2 p-0 d-flex justify-content-center">
            {currentAddress && githubLogin && pullRequest?.state === 'open' && (
              <Button onClick={handleShowModal}>
                <span>Make a Review</span>
              </Button>
            )}
          </div>

          <div className="col-2 p-0">
            <GithubLink
              repoId={String(repoId)}
              forcePath={activeRepo?.githubPath}
              hrefPath={`pull/${pullRequest?.githubId || ''}`}
            >
              view on github
            </GithubLink>
          </div>

          <div className="col-12 mt-4">
            {(pullRequest?.reviews?.length > 0 && renderReviews()) || (
              <NothingFound description="No reviews found" />
            )}
          </div>
        </div>
      </CustomContainer>

      <CreateReviewModal
        show={showModal}
        onCloseClick={handleCloseModal}
        issue={issue}
        pullRequest={pullRequest}
      />
    </>
  )
}
