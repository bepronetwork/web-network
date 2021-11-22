import { ApplicationContext } from '@contexts/application'
import { addToast } from '@contexts/reducers/add-toast'
import useApi from '@x-hooks/use-api'
import { useContext, useEffect, useState } from 'react'

import Button from './button'
import GithubLink from './github-link'
import Modal from './modal'

export default function NotMergeableModal({
  currentGithubLogin,
  currentAddress,
  issue,
  pullRequest,
  mergeProposal,
  isFinalized = false,
  isCouncil = false
}) {
  const { dispatch } = useContext(ApplicationContext)
  const [isVisible, setVisible] = useState(false)
  const [mergeState, setMergeState] = useState('')
  const isIssueOwner = issue?.creatorGithub === currentGithubLogin
  const isPullRequestOwner = pullRequest?.githubLogin === currentGithubLogin
  const isProposer =
    mergeProposal?.proposalAddress?.toLowerCase() === currentAddress
  const { mergeClosedIssue } = useApi()

  function handleModalVisibility() {
    if (mergeState === 'success') {
      setVisible(false)
    } else if (
      (isIssueOwner || isPullRequestOwner || isCouncil || isProposer) &&
      ((pullRequest?.state === 'open' && isFinalized) ||
        (!isFinalized && !pullRequest?.isMergeable))
    ) {
      setVisible(true)
    }
  }

  function handleRetryMerge() {
    if (mergeState == 'error') return false

    setMergeState('loading')

    mergeClosedIssue(
      issue.issueId,
      pullRequest.githubId,
      mergeProposal._id,
      currentAddress
    )
      .then((response) => {
        dispatch(
          addToast({
            type: 'success',
            title: 'Success',
            content: 'Pull Request merged'
          })
        )

        setMergeState('success')
      })
      .catch((error) => {
        dispatch(
          addToast({
            type: 'danger',
            title: 'Failed',
            content: error.response.data.message
          })
        )

        setMergeState('error')
      })
  }

  useEffect(handleModalVisibility, [
    currentGithubLogin,
    currentAddress,
    issue,
    pullRequest,
    mergeProposal,
    isFinalized,
    isCouncil,
    mergeState
  ])

  return (
    <Modal
      show={isVisible}
      title="Merging Issue"
      titlePosition="center"
      centerTitle
    >
      <div>
        <div className="d-flex justify-content-center m-2 text-center">
          <p className="h4 mb-2 text-white">
            {(isFinalized &&
              'This issue was closed and distributed but the code was unable to be merged.') ||
              ''}

            {(!isFinalized &&
              !pullRequest?.isMergeable &&
              'This proposal has github conflicts and cannot be merged. Please, fix it before doing so.') ||
              ''}
          </p>
        </div>
        <div className="d-flex justify-content-center">
          {isCouncil && isFinalized && (
            <Button
              color={`${
                (mergeState === 'error' && 'transparent') || 'primary'
              }`}
              textClass={`${
                (mergeState === 'error' && 'text-danger') || undefined
              }`}
              disabled={mergeState !== ''}
              onClick={handleRetryMerge}
            >
              {mergeState === 'error' ? 'Merge failed' : 'Retry Merge'}
              {mergeState === 'loading' && (
                <span className="spinner-border spinner-border-xs ml-1" />
              )}
            </Button>
          )}

          <GithubLink
            forcePath={issue?.repo}
            hrefPath={`pull/${pullRequest?.githubId || ''}/conflicts`}
            color="primary"
          >
            Go to Pull Request
          </GithubLink>
        </div>
      </div>
    </Modal>
  )
}
