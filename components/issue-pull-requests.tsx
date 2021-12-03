import NothingFound from './nothing-found'
import PullRequestItem from './pull-request-item'

export default function IssuePullRequests({
  repoId,
  className = '',
  issueId,
  pullResquests = []
}) {
  return (
    <div
      className={`content-wrapper ${className} pt-0 ${
        (pullResquests.length > 0 && 'pb-0') || 'pb-3'
      }`}
    >
      {(pullResquests.length > 0 &&
        pullResquests.map((pullRequest) => (
          <PullRequestItem
            key={pullRequest.id}
            repoId={repoId}
            pullRequest={pullRequest}
            issueId={issueId}
          />
        ))) || <NothingFound description={'No pull requests found'} />}
    </div>
  )
}
