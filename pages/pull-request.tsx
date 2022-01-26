import { useContext, useEffect, useState } from 'react'

import { head } from 'lodash'
import { useRouter } from 'next/router'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

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
import useApi from '@x-hooks/use-api'
import { addToast } from '@contexts/reducers/add-toast'
import { useTranslation } from 'next-i18next'

export default function PullRequest() {
  const {
    dispatch,
    state: { loading, githubLogin, currentAddress }
  } = useContext(ApplicationContext)

  const router = useRouter()
  const [[activeRepo]] = useRepos()
  const { createReviewForPR, getIssue } = useApi()
  const [issue, setIssue] = useState<IssueData>()
  const [showModal, setShowModal] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [pullRequest, setPullRequest] = useState<pullRequest>()
  const { getMergedDataFromPullRequests } = useMergeData()
  const { t } = useTranslation(['common', 'pull-request'])

  const { repoId, issueId, prId, review } = router.query

  function loadData() {
    const [repo, githubId] = String(issueId).split('/')

    if (!activeRepo) return

    dispatch(changeLoadState(true))

    getIssue(String(repoId), githubId)
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

  function handleCreateReview({ body }) {
    setIsExecuting(true)

    createReviewForPR(String(issueId), String(prId), githubLogin, body)
      .then((response) => {
        dispatch(
          addToast({
            type: 'success',
            title: t('actions.success'),
            content: t('pull-request:actions.review.success')
          })
        )

        setPullRequest({...pullRequest, comments: [...pullRequest.comments, response.data]})
        
        setIsExecuting(false)
        handleCloseModal()
      })
      .catch((error) => {
        dispatch(
          addToast({
            type: 'danger',
            title: t('actions.failed'),
            content: t('pull-request:actions.review.error')
          })
        )

        setIsExecuting(false)
      })
  }

  function handleShowModal() {
    setShowModal(true)
  }

  function handleCloseModal() {
    setShowModal(false)
  }

  useEffect(loadData, [activeRepo, issueId, prId])
  useEffect(() => {
    if (review && issue && pullRequest && githubLogin) setShowModal(true)
  }, [review, issue, pullRequest])

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
            <span className="caption-large text-uppercase">
              {t('pull-request:review', { count: pullRequest?.comments?.length })}
            </span>
          </div>

          <div className="col-2 p-0 d-flex justify-content-center">
            {currentAddress && githubLogin && pullRequest?.state === 'open' && (
              <Button onClick={handleShowModal}>
                {t('actions.make-a-review')}
              </Button>
            )}
          </div>

          <div className="col-2 p-0">
            <GithubLink
              repoId={String(repoId)}
              forcePath={activeRepo?.githubPath}
              hrefPath={`pull/${pullRequest?.githubId || ''}`}
            >
              {t('actions.view-on-github')}
            </GithubLink>
          </div>

          <div className="col-12 mt-4">
            {(pullRequest?.comments?.length > 0 &&
              pullRequest?.comments?.map((comment, index) => (
                <Comment comment={comment} key={index} />
              ))) || <NothingFound description={t('pull-request:errors.no-reviews-found')} />}
          </div>
        </div>
      </CustomContainer>

      <CreateReviewModal
        show={showModal}
        onCloseClick={handleCloseModal}
        issue={issue}
        pullRequest={pullRequest}
        onConfirm={handleCreateReview}
        isExecuting={isExecuting}
      />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'pull-request'])),
    },
  };
};