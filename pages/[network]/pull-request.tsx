import { head } from 'lodash'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { GetServerSideProps } from 'next/types'
import { useContext, useEffect, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Button from '@components/button'
import Comment from '@components/comment'
import GithubLink from '@components/github-link'
import NothingFound from '@components/nothing-found'
import CustomContainer from '@components/custom-container'
import PullRequestHero from '@components/pull-request-hero'
import CreateReviewModal from '@components/create-review-modal'
import ReadOnlyButtonWrapper from '@components/read-only-button-wrapper'

import { useRepos } from '@contexts/repos'
import { addToast } from '@contexts/reducers/add-toast'
import { ApplicationContext } from '@contexts/application'
import { useAuthentication } from '@contexts/authentication'
import { changeLoadState } from '@contexts/reducers/change-load-state'

import { formatDate } from '@helpers/formatDate'
import { formatNumberToCurrency } from '@helpers/formatNumber'

import { IssueData, pullRequest } from '@interfaces/issue-data'

import useApi from '@x-hooks/use-api'
import useNetwork from '@x-hooks/use-network'
import useMergeData from '@x-hooks/use-merge-data'

export default function PullRequest() {
  const router = useRouter()
  const { t } = useTranslation(['common', 'pull-request'])
  
  const [issue, setIssue] = useState<IssueData>()
  const [showModal, setShowModal] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [pullRequest, setPullRequest] = useState<pullRequest>()
  
  const { network } = useNetwork()
  const { activeRepo } = useRepos()
  const { wallet, user } = useAuthentication()
  const { dispatch } = useContext(ApplicationContext)

  const { createReviewForPR, getIssue } = useApi()
  const { getMergedDataFromPullRequests } = useMergeData()

  const { repoId, issueId, prId, review } = router.query

  function loadData() {
    const [repo, githubId] = String(issueId).split('/')

    if (!activeRepo) return

    dispatch(changeLoadState(true))

    getIssue(String(repoId), githubId, network?.name)
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
      .catch(console.log)
      .finally(() => dispatch(changeLoadState(false)))
  }

  function handleCreateReview({ body }) {
    if (!user?.login) return

    setIsExecuting(true)

    createReviewForPR(String(issueId), String(prId), user.login, body, network?.name)
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
    if (review && issue && pullRequest && user?.login) setShowModal(true)
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
        pullRequest={pullRequest}
      />
      <CustomContainer>
        <div className="row align-items-center bg-shadow border-radius-8 px-3 py-4">
          <div className="col-8">
            <span className="caption-large text-uppercase">
              {t('pull-request:review', { count: pullRequest?.comments?.length })}
            </span>
          </div>

          <div className="col-2 p-0 d-flex justify-content-center">
            {wallet?.address && user?.login && pullRequest?.state === 'open' && (
              <ReadOnlyButtonWrapper>
                <Button className="read-only-button" onClick={handleShowModal}>
                  {t('actions.make-a-review')}
                </Button>
              </ReadOnlyButtonWrapper>
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
      ...(await serverSideTranslations(locale, ['common', 'pull-request'])),
    },
  };
};