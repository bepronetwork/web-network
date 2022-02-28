import { ApplicationContext } from '@contexts/application'
import { addToast } from '@contexts/reducers/add-toast'
import useApi from '@x-hooks/use-api'
import { useTranslation } from 'next-i18next'
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
  issuePRs,
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
  const hasPRMerged = !!issuePRs?.find((pr) => pr.merged === true)
  const { mergeClosedIssue } = useApi()
  const { t } = useTranslation('common')

  function handleModalVisibility() {
    if (!pullRequest || !issuePRs?.length || mergeState === 'success') return

    if (hasPRMerged || (pullRequest.isMergeable && !isFinalized) || !(isIssueOwner || isPullRequestOwner || isCouncil || isProposer)) {
      setVisible(false)
    } else if (isIssueOwner || isPullRequestOwner || isCouncil || isProposer){
      setVisible(pullRequest.state === 'open')
    }  
  }

  function handleRetryMerge() {
    if (mergeState == 'error') return false

    setMergeState('loading')

    mergeClosedIssue(
      issue?.issueId,
      pullRequest.githubId,
      mergeProposal._id,
      currentAddress
    )
      .then((response) => {
        dispatch(
          addToast({
            type: 'success',
            title: t('actions.success'),
            content: t('modals.not-mergeable.success-message')
          })
        )

        setMergeState('success')
        setVisible(false)
      })
      .catch((error) => {
        dispatch(
          addToast({
            type: 'danger',
            title: t('actions.failed'),
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
    mergeState,
    issuePRs
  ])

  return (
    <Modal
      show={isVisible}
      title={t('modals.not-mergeable.title')}
      titlePosition="center"
      onCloseClick={() => setVisible(false)}
      centerTitle
    >
      <div>
        <div className="d-flex justify-content-center m-2 text-center">
          <p className="h4 mb-2 text-white">
            {(isFinalized &&
              t('modals.not-mergeable.closed-bounty')) ||
              ''}

            {(!isFinalized &&
              t('modals.not-mergeable.open-bounty')) ||
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
              <span className="text-nowrap">{mergeState === 'error' ? t('modals.not-mergeable.merge-failed') : t('modals.not-mergeable.retry-merge')}</span>
              {mergeState === 'loading' && (
                <span className="spinner-border spinner-border-xs ml-1" />
              )}
            </Button>
          )}
          <GithubLink
            forcePath={issue?.repository?.githubPath}
            hrefPath={`pull/${pullRequest?.githubId || ''}/conflicts`}
            color="primary">
            {t('modals.not-mergeable.go-to-pr')}
          </GithubLink>
          <Button color="dark-gray" onClick={() => setVisible(false)}>{t('actions.close')}</Button>
        </div>
      </div>
    </Modal>
  )
}
