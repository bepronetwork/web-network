import { useEffect, useState } from 'react'

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
  const [isVisible, setVisible] = useState(false)
  const [mergeState, setMergeState] = useState('')
  const isIssueOwner = issue?.creatorGithub === currentGithubLogin
  const isPullRequestOwner = pullRequest?.githubLogin === currentGithubLogin
  const isProposer =
    mergeProposal?.proposalAddress?.toLowerCase() === currentAddress

  function handleModalVisibility() {
    console.log('isIssueOwner', isIssueOwner)
    console.log('isPullRequestOwner', isIssueOwner)
    console.log('isCouncil', isCouncil)
    console.log('isFinalized', isFinalized)
    console.table('issue:', issue)
    console.table('pullRequest:', pullRequest)
    console.table('mergeProposal:', mergeProposal)
    console.table('currentAddress:', currentAddress)

    if (
      (isIssueOwner || isPullRequestOwner || isCouncil || isProposer) &&
      pullRequest?.state === 'open'
    ) {
      setVisible(true)

      console.log('handleModalVisibility')
    }
  }

  function handleRetryMerge() {
    if (mergeState == 'error') return false

    setMergeState('loading')
  }

  useEffect(handleModalVisibility, [issue, pullRequest, isFinalized, isCouncil])

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
              !pullRequest.isMergeable &&
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
