import { useContext, useEffect, useState } from 'react'

import LockedIcon from '@assets/icons/locked-icon'

import Modal from '@components/modal'
import Button from '@components/button'
import GithubInfo from '@components/github-info'

import { ApplicationContext } from '@contexts/application'

import Avatar from '@components/avatar'

import { formatDate } from '@helpers/formatDate'

import useRepos from '@x-hooks/use-repos'

export default function CreateReviewModal({
  show = false,
  isExecuting = false,
  onConfirm = ({ body }) => {},
  onCloseClick = () => {},
  issue,
  pullRequest
}) {
  const [body, setBody] = useState('')
  const [[activeRepo]] = useRepos()

  const {
    state: { githubLogin }
  } = useContext(ApplicationContext)

  function isButtonDisabled(): boolean {
    return body.trim() === '' || isExecuting
  }

  function setDefaults() {
    setBody('')
  }

  useEffect(setDefaults, [show])

  return (
    <Modal
      size="lg"
      show={show}
      onCloseClick={onCloseClick}
      title="Review"
      titlePosition="center"
    >
      <div className="container">
        <div className="mb-2">
          <p className="caption-small trans mb-2">
            #{issue?.githubId} {issue?.title}
          </p>

          <p className="h4 mb-2">Pull Request #{pullRequest?.githubId}</p>

          <div className="d-flex align-items-center flex-wrap justify-content-center justify-content-md-start">
            <span className="caption-small text-gray mr-2">
              Created at {pullRequest && formatDate(pullRequest?.createdAt)}
            </span>

            <GithubInfo
              color="primary"
              bgColor="white"
              borderColor="transparent"
              value={activeRepo?.githubPath?.split('/')[1]}
            />

            <span className="caption-small text-gray ml-2 mr-2">BY</span>

            <GithubInfo
              color="white"
              bgColor="transparent"
              value={`@${pullRequest?.githubLogin}`}
            />

            <Avatar className="ml-2" userLogin={pullRequest?.githubLogin} />
          </div>
        </div>
        <div>
          <div className="form-group">
            <label className="caption-small mb-2 text-gray">
              Review
            </label>
            <textarea
              value={body}
              rows={5}
              onChange={(e) => setBody(e.target.value)}
              className="form-control"
              placeholder="Type a review..."
            />
          </div>
        </div>
        <div className="d-flex pt-2 justify-content-center">
          <Button
            className="mr-2"
            disabled={isButtonDisabled()}
            onClick={() => onConfirm({ body })}
          >
            {isButtonDisabled() && !isExecuting && <LockedIcon className="me-2" />}
            <span>Create Review</span>
            {isExecuting ? <span className="spinner-border spinner-border-xs ml-1"/> : ''}
          </Button>
          <Button color="dark-gray" onClick={onCloseClick}>
            cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
