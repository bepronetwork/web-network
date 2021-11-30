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
import useCount from '@x-hooks/use-count'
import { changeLoadState } from '@contexts/reducers/change-load-state'

export default function MyPullRequests() {
  const {
    dispatch,
    state: { loading, githubLogin, currentAddress }
  } = useContext(ApplicationContext)

  const [issues, setIssues] = useState([])
  const { getIssuesOfUserPullRequests } = useMergeData()

  const page = usePage()
  const router = useRouter()
  const results = useCount()

  function setListIssues(rows) {
    setIssues(rows.map(row => row.issue))
  }

  function getIssues() {
    if (!githubLogin || !currentAddress) return

    dispatch(changeLoadState(true))

    getIssuesOfUserPullRequests(page, githubLogin)
      .then(({ rows, count }) => {
        results.setCount(count)
        return rows
      })
      .then(setListIssues)
      .catch((error) => {
        console.error('Error fetching issues', error)
      })
      .finally(() => {
        dispatch(changeLoadState(false))
      })
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
              count={results.count}
              onChange={(page) =>
                router.push({ pathname: `/account/my-pull-requests`, query: { page } })
              }
            />
          )}
          {issues?.length === 0 && !loading.isLoading ? (
            <div className="col-md-10 pt-3">
              <NothingFound description={'No pull requests'}>
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
