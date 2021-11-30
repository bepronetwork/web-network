import React, { useContext, useEffect, useState } from 'react'
import Account from '@components/account'
import ConnectWalletButton from '@components/connect-wallet-button'
import ListIssues from '@components/list-issues'
import Paginate from '@components/paginate'
import { useRouter } from 'next/router'
import NothingFound from '@components/nothing-found'
import InternalLink from '@components/internal-link'
import useMergeData from '@x-hooks/use-merge-data'
import { ApplicationContext } from '@contexts/application'
import usePage from '@x-hooks/use-page'

export default function MyPullRequests() {
	const {dispatch, state: {githubLogin, currentAddress}} = useContext(ApplicationContext)
  const [issues, setIssues] = useState([])
	const router = useRouter()
	const {getIssuesOfUserPullRequests} = useMergeData()
	const page = usePage()

	function getIssues() {
		getIssuesOfUserPullRequests(page, githubLogin).then(data => setIssues(data))
	}

	useEffect(getIssues, [page, githubLogin, currentAddress])

  return (
    <Account>
      <ConnectWalletButton asModal={true} />
      <div className="container p-footer">
        <div className="row justify-content-center">
          <ListIssues listIssues={issues} />
          {issues?.length !== 0 && (
            <Paginate
              count={issues.length}
              onChange={(page) =>
                router.push({ pathname: `/`, query: { page } })
              }
            />
          )}
          {issues?.length === 0 ? (
            <div className="col-md-10 pt-3">
              <NothingFound description={"No pull requests"}>
                <InternalLink
                  href="/developers"
                  label="Find an issue to work on"
                  uppercase
                />
              </NothingFound>
            </div>
          ) : null}
        </div>
      </div>
    </Account>
  )
}
