import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { FormControl, InputGroup } from 'react-bootstrap'

import CloseIcon from '@assets/icons/close-icon'
import SearchIcon from '@assets/icons/search-icon'

import ListSort from '@components/list-sort'
import NothingFound from '@components/nothing-found'
import InternalLink from '@components/internal-link'
import IssueFilters from '@components/issue-filters'
import IssueListItem from '@components/issue-list-item'
import InfiniteScroll from '@components/infinite-scroll'
import CustomContainer from '@components/custom-container'

import { ApplicationContext } from '@contexts/application'
import { changeLoadState } from '@contexts/reducers/change-load-state'

import { IssueData } from '@interfaces/issue-data'

import useApi from '@x-hooks/use-api'
import usePage from '@x-hooks/use-page'

type Filter = {
  label: string
  value: string
  emptyState: string
}

type FiltersByIssueState = Filter[]

export default function ListIssues(): JSX.Element {
  const {
    dispatch,
    state: { loading }
  } = useContext(ApplicationContext)

  const page = usePage()
  const router = useRouter()
  const { searchIssues } = useApi()
  const [search, setSearch] = useState('')
  const { t } = useTranslation(['common', 'bounty'])
  const [issues, setIssues] = useState<IssueData[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)

  const { repoId, time, state, sortBy, order } = router.query as { repoId: string, time: string, state: string, sortBy: string, order: string }

  const filtersByIssueState: FiltersByIssueState = [
    {
      label: t('filters.bounties.all'),
      value: 'all',
      emptyState: t('filters.bounties.not-found')
    },
    {
      label: t('filters.bounties.open'),
      value: 'open',
      emptyState: t('filters.bounties.open-not-found')
    },
    {
      label: t('filters.bounties.draft'),
      value: 'draft',
      emptyState: t('filters.bounties.draft-not-found')
    },
    {
      label: t('filters.bounties.closed'),
      value: 'closed',
      emptyState: t('filters.bounties.closed-not-found')
    }
  ]

  const [filterByState, setFilterByState] = useState<Filter>(
    filtersByIssueState[0]
  )

  function hasFilter(): boolean {
    if (state || time || repoId) return true

    return false
  }

  function showClearButton(): boolean {
    if (search.trim() !== '') return true

    return false
  }

  function handleClearSearch(): void {
    setSearch('')

    getIssues(true)
  }

  function updateIssuesList(issues: IssueData[]) {
    setIssues(issues)
  }

  function getIssues(forceEmptySearch = false) {
    dispatch(changeLoadState(true))
    searchIssues({ page, repoId, time, state, sortBy, order, search: forceEmptySearch ? '' : search })
      .then(({ rows, pages }) => {
        setTotalPages(pages)

        return rows
      })
      .then(updateIssuesList)
      .catch((error) => {
        console.error('Error fetching issues', error)
      })
      .finally(() => {
        dispatch(changeLoadState(false))
      })
  }

  function handleSearch(event) {
    if (event.key !== 'Enter' || loading.isLoading) return

    getIssues()
  }

  useEffect(getIssues, [page, repoId, time, state, sortBy, order])

  return (
    <CustomContainer>
        <div className={`row ${parseInt(page) > 1 && 'mb-0' || 'mb-3'} align-items-center list-actions`}>
          <div className={`col-${(hasFilter() && '7') || '8'} m-0`}>
            <InputGroup>
              <InputGroup.Text className="rounded-8" onClick={e => getIssues()}>
                <SearchIcon />
              </InputGroup.Text>

              <FormControl
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-8 p-2"
                placeholder={t('bounty:search')}
                onKeyDown={handleSearch}
              />

              {showClearButton() && (
                <button
                  className="btn bg-black border-0 rounded-8 py-0 px-3"
                  onClick={handleClearSearch}
                >
                  <CloseIcon width={10} height={10} />
                </button>
              )}
            </InputGroup>
          </div>

          <div
            className={`col-${
              (hasFilter() && '5') || '4'
            } d-flex align-items-center justify-content-between pl-0 pr-1`}
          >
            <div className="d-flex align-items-center">
              <span className="caption-small text-white-50 mr-1">
                {t('sort.label')}
              </span>

              <ListSort
                options={[
                  {
                    value: 'newest',
                    sortBy: 'createdAt',
                    order: 'DESC',
                    label: t('sort.types.newest')
                  },
                  {
                    value: 'highest-bounty',
                    sortBy: 'amount',
                    order: 'DESC',
                    label: t('sort.types.highest-bounty')
                  },
                  {
                    value: 'oldest',
                    sortBy: 'createdAt',
                    order: 'ASC',
                    label: t('sort.types.oldest')
                  },
                  {
                    value: 'lowest-bounty',
                    sortBy: 'amount',
                    order: 'ASC',
                    label: t('sort.types.lowest-bounty')
                  }
                ]}
              />
            </div>

            <IssueFilters />
          </div>
        </div>

        <InfiniteScroll pages={totalPages} page={parseInt(page)} isLoading={loading.isLoading} >
          {issues?.length === 0 && !loading.isLoading ? (
            <NothingFound description={filterByState.emptyState}>
              <InternalLink
                href="/create-bounty"
                label={String(t('actions.create-one'))}
                uppercase
              />
            </NothingFound>
          ) : null}

          <div>
            {issues?.map((issue) => (
              <IssueListItem issue={issue} key={issue.githubId} />
            ))}
          </div>
      </InfiniteScroll>
    </CustomContainer>
  )
}
