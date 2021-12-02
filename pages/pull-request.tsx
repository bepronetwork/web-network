import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { head } from 'lodash'

import PullRequestHero from '@components/pull-request-hero'

import { ApplicationContext } from '@contexts/application'
import { changeLoadState } from '@contexts/reducers/change-load-state'

import useRepos from '@x-hooks/use-repos'
import useMergeData from '@x-hooks/use-merge-data'

import { formatDate } from '@helpers/formatDate'
import { formatNumberToCurrency } from '@helpers/formatNumber'

import { IssueData, pullRequest } from '@interfaces/issue-data'
import CustomContainer from '@components/custom-container'

export default function PullRequest() {
  const {
    dispatch,
    state: { loading, githubLogin, currentAddress }
  } = useContext(ApplicationContext)

  const router = useRouter()
  const [[activeRepo]] = useRepos()
  const [issue, setIssue] = useState<IssueData>()
  const [pullRequest, setPullRequest] = useState<pullRequest>()
  const { getIssue, getMergedDataFromPullRequests } = useMergeData()

  const { issueId, prId } = router.query

  function loadData() {
    const [repoId, githubId] = String(issueId).split('/')

    if (!activeRepo) return

    dispatch(changeLoadState(true))

    getIssue(repoId, githubId, activeRepo?.githubPath)
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

  useEffect(loadData, [activeRepo, issueId, prId])

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
        <span>Pull Requests</span>
      </CustomContainer>
    </>
  )
}
