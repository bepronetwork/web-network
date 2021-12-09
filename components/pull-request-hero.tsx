import useRepos from '@x-hooks/use-repos'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import Avatar from './avatar'
import GithubInfo from './github-info'
import InternalLink from './internal-link'

export default function PullRequestHero({
  githubId,
  title,
  pullRequestId,
  authorPullRequest,
  createdAt,
  beproStaked
}) {
  const router = useRouter()
  const { issueId: issueCID } = router.query
  const [repoId, issueId] = (issueCID as string).split(`/`)
  const [[activeRepo]] = useRepos()

  return (
    <div className="banner bg-bepro-blue mb-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex flex-column">
              <div className="d-flex align-items-center cursor-pointer text-truncate">
                <InternalLink
                  iconBefore={true}
                  href={{ pathname: '/bounty', query: { id: issueId, repoId } }}
                  icon={<i className="ico-back me-2" />}
                  label={`#${githubId} ${title}`}
                  className="p-nm caption"
                  transparent
                />
              </div>
              <div className="row">
                <div className="col-md-9">
                  <div className="top-border">
                    <h1 className="h4 mb-3">Pull Request #{pullRequestId}</h1>
                    <div className="d-flex align-items-center flex-wrap justify-content-center justify-content-md-start">
                      <span className="caption-small text-gray mr-2">
                        Created at {createdAt}
                      </span>

                      <GithubInfo
                        color="primary"
                        bgColor="white"
                        value={activeRepo?.githubPath?.split('/')[1]}
                      />

                      <span className="caption-small text-gray ml-2 mr-2">BY</span>

                      <GithubInfo
                        color="white"
                        bgColor="primary"
                        value={`@${authorPullRequest}`}
                      />

                      <Avatar className="ml-2" userLogin={authorPullRequest} />
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="banner-highlight">
                    <h4 className="h4 mb-0">
                      {beproStaked}{' '}
                      <span className="p-small trans">$BEPRO</span>
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
