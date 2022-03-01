import { useTranslation } from 'next-i18next'
import { useContext, useEffect, useState } from 'react'

import Modal from '@components/modal'
import Button from '@components/button'
import GithubLink from '@components/github-link'

import { addToast } from '@contexts/reducers/add-toast'
import { ApplicationContext } from '@contexts/application'

import useApi from '@x-hooks/use-api'
import useNetwork from '@x-hooks/use-network'

export default function NotMergeableModal({
  issue,
  issuePRs,
  pullRequest,
  mergeProposal,
  currentAddress,
  isCouncil = false,
  currentGithubLogin,
  isFinalized = false
}) {
  const { t } = useTranslation('common')
  
  const { dispatch } = useContext(ApplicationContext)

  const [isVisible, setVisible] = useState(false)
  const [mergeState, setMergeState] = useState('')
  
  const { network } = useNetwork()
  const { mergeClosedIssue } = useApi()
  
  const isIssueOwner = issue?.creatorGithub === currentGithubLogin
  const isPullRequestOwner = pullRequest?.githubLogin === currentGithubLogin
  const isProposer =
    mergeProposal?.proposalAddress?.toLowerCase() === currentAddress
  const hasPRMerged = !!issuePRs?.find((pr) => pr.merged === true)

  function handleModalVisibility() {
    if (!pullRequest || !issuePRs?.length || mergeState === 'success') return

    if (
      hasPRMerged || // Already exists a Pull Request merged to this bounty.
      (pullRequest.isMergeable && !isFinalized) || // The Pull Request was not merged year and the bounty is open.
      !(isIssueOwner || isPullRequestOwner || isCouncil || isProposer) ||  // The user is not the bounty creator, nor the pull request creator, 
                                                                           // nor the proposal creator and is not a council member.
      ((isIssueOwner || isCouncil || isProposer) && !isPullRequestOwner && !isFinalized) // The bounty creator, proposal creator and council members can view only if the bounty was closed.
      ) {
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
      currentAddress,
      network?.name
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
    issue,
    issuePRs,
    isCouncil,
    mergeState,
    isFinalized,
    pullRequest,
    mergeProposal,
    currentAddress,
    currentGithubLogin
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
          {isPullRequestOwner && <GithubLink
            forcePath={issue?.repository?.githubPath}
            hrefPath={`pull/${pullRequest?.githubId || ''}/conflicts`}
            color="primary">
            {t('modals.not-mergeable.go-to-pr')}
          </GithubLink> }
          <Button color="dark-gray" onClick={() => setVisible(false)}>{t('actions.close')}</Button>
        </div>
      </div>
    </Modal>
  )
}
