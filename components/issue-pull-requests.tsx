import NothingFound from './nothing-found'
import PullRequestItem from './pull-request-item'

export default function IssuePullRequests({ isIssueFinalized = false, pullResquests = [] }) {
  return (
    <div
      className={`content-wrapper mb-4 pt-0 ${
        (pullResquests.length > 0 && 'pb-0') || 'pb-3'
      }`}
    >
      {(pullResquests.length > 0 &&
        pullResquests.map((pullRequest) => (
          <PullRequestItem key={pullRequest.id} pullRequest={pullRequest} canReview={!isIssueFinalized} />
        ))) || <NothingFound description={'No pull requests found'} />}
    </div>
  )
}
