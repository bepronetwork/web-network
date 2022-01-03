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
import ScrollTopButton from '@components/scroll-top-button'

import { ApplicationContext } from '@contexts/application'
import { changeLoadState } from '@contexts/reducers/change-load-state'

import { IssueData } from '@interfaces/issue-data'

import useApi from '@x-hooks/use-api'

type Filter = {
  label: string
  value: string
  emptyState: string
}

type FiltersByIssueState = Filter[]

interface ListIssuesProps {
  filterState?: string
  emptyMessage?: string
  creator?: string
  pullRequester?: string
}

interface IssuesPage {
  page: number
  issues: IssueData[]
}

export default function ListIssues({
  filterState,
  emptyMessage,
  creator,
  pullRequester
}: ListIssuesProps): JSX.Element {
  const {
    dispatch,
    state: { loading }
  } = useContext(ApplicationContext)

  const router = useRouter()
  const { searchIssues } = useApi()
  const [search, setSearch] = useState('')
  const { t } = useTranslation(['common', 'bounty'])
  const [issuesPages, setIssuesPages] = useState<IssuesPage[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  const { repoId, time, state, sortBy, order } = router.query as {
    repoId: string
    time: string
    state: string
    sortBy: string
    order: string
  }

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

  function getIssues(forceEmptySearch = false) {
    if (!page) return

    dispatch(changeLoadState(true))
    searchIssues({
      page: String(page),
      repoId,
      time,
      state: filterState || state,
      search: forceEmptySearch ? '' : search,
      sortBy,
      order,
      creator,
      pullRequester
    })
      .then(({ rows, pages, currentPage }) => {
        if (currentPage > 1) {
          if (issuesPages.find((el) => el.page === currentPage)) return

          const tmp = [...issuesPages, { page: currentPage, issues: rows }]

          tmp.sort((pageA, pageB) => {
            if (pageA.page < pageB.page) return -1
            if (pageA.page > pageB.page) return 1

            return 0
          })

          setIssuesPages(tmp)
        } else {
          setIssuesPages([{ page: currentPage, issues: rows }])
        }

        setHasMore(currentPage < pages)
      })
      .catch((error) => {
        console.error('Error fetching issues', error)
      })
      .finally(() => {
        dispatch(changeLoadState(false))
      })
  }

  function handleSearch(event) {
    if (event.key !== 'Enter' || loading.isLoading) return

    setPage(1)
  }

  function handleNextPage() {
    setPage(page + 1)
  }

  useEffect(getIssues, [page, repoId, time, state, sortBy, order])
  useEffect(() => {
    setPage(1)
  }, [repoId, time, state, sortBy, order])

  return (
    <CustomContainer>
      <div className={`row mb-3 align-items-center list-actions`}>
        <div
          className={`col-${
            (filterState && '9') || (hasFilter() && '7') || '8'
          } m-0`}
        >
          <InputGroup>
            <InputGroup.Text className="rounded-8" onClick={(e) => getIssues()}>
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
            (filterState && '3') || (hasFilter() && '5') || '4'
          } d-flex align-items-center justify-content-${
            (filterState && 'end') || 'between'
          } pl-0 pr-1`}
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

          {!filterState && <IssueFilters />}
        </div>
      </div>

      {issuesPages.every((el) => el.issues?.length === 0) &&
      !loading.isLoading ? (
        <NothingFound description={emptyMessage || filterByState.emptyState}>
          <InternalLink
            href="/create-bounty"
            label={String(t('actions.create-one'))}
            uppercase
          />
        </NothingFound>
      ) : null}

      {(issuesPages.some((el) => el.issues?.length > 0) && (
        <InfiniteScroll
          handleNewPage={handleNextPage}
          isLoading={loading.isLoading}
          hasMore={hasMore}
        >
          {issuesPages.map(({ issues }) => {
            return issues?.map((issue) => (
              <IssueListItem issue={issue} key={issue.githubId} />
            ))
          })}
        </InfiniteScroll>
      )) || <></>}

      <ScrollTopButton />
    </CustomContainer>
  )
}
