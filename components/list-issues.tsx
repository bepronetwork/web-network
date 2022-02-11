import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { FormControl, InputGroup } from 'react-bootstrap'

import CloseIcon from '@assets/icons/close-icon'
import SearchIcon from '@assets/icons/search-icon'

import Button from '@components/button'
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
import usePage from '@x-hooks/use-page'
import useSearch from '@x-hooks/use-search'

type Filter = {
  label: string
  value: string
  emptyState: string
}

type FiltersByIssueState = Filter[]

interface ListIssuesProps {
  creator?: string
  redirect?: string
  filterState?: string
  emptyMessage?: string
  buttonMessage?: string
  pullRequester?: string
}

interface IssuesPage {
  page: number
  issues: IssueData[]
}

export default function ListIssues({
  creator,
  redirect,
  filterState,
  emptyMessage,
  buttonMessage,
  pullRequester
}: ListIssuesProps): JSX.Element {
  const {
    dispatch,
    state: { loading }
  } = useContext(ApplicationContext)

  const router = useRouter()
  const { searchIssues } = useApi()
  const { t } = useTranslation(['common', 'bounty'])
  const [issuesPages, setIssuesPages] = useState<IssuesPage[]>([])
  const [hasMore, setHasMore] = useState(false)
  const { page, nextPage, goToFirstPage } = usePage()
  const { search, setSearch, clearSearch } = useSearch()
  const [searchState, setSearchState] = useState(search)
  const [truncatedData, setTruncatedData] = useState(false)

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
    setSearchState('')
    clearSearch()
  }

  function getIssues() {
    dispatch(changeLoadState(true))

    searchIssues({
      page,
      repoId,
      time,
      state: filterState || state,
      search,
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
    if (event.key !== 'Enter') return

    setSearch(searchState)
  }

  useEffect(() => {
    if (page) {
      const pagesToValidate = [...Array(+page).keys()].map((i) => i + 1)

      setTruncatedData(
        !pagesToValidate.every((pageV) =>
          issuesPages.find((el) => el.page === pageV)
        )
      )
    }
  }, [page, issuesPages])

  useEffect(getIssues, [page, search, repoId, time, state, sortBy, order])

  return (
    <CustomContainer>
      <div
        className={`d-flex align-items-center gap-20 list-actions sticky-top`}
      >
        <div className="w-100">
          <InputGroup>
            <InputGroup.Text className="rounded-8" onClick={(e) => getIssues()}>
              <SearchIcon />
            </InputGroup.Text>

            <FormControl
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
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

        <div className="d-flex align-items-center">
          <span className="caption-small text-white-50 text-nowrap mr-1">
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
                value: 'oldest',
                sortBy: 'createdAt',
                order: 'ASC',
                label: t('sort.types.oldest')
              },
              {
                value: 'highest-bounty',
                sortBy: 'amount',
                order: 'DESC',
                label: t('sort.types.highest-bounty')
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

      {(truncatedData && (
        <div className="row justify-content-center mb-3">
          <div className="d-flex col-6 align-items-center justify-content-center">
            <span className="caption-small mr-1">results truncated</span>
            <Button onClick={goToFirstPage}>back to top</Button>
          </div>
        </div>
      )) || <></>}

      {issuesPages.every((el) => el.issues?.length === 0) &&
      !loading.isLoading ? (
        <NothingFound description={emptyMessage || filterByState.emptyState}>
          <InternalLink
            href={redirect ||"/create-bounty"}
            label={buttonMessage || String(t('actions.create-one'))}
            uppercase
          />
        </NothingFound>
      ) : null}

      {(issuesPages.some((el) => el.issues?.length > 0) && (
        <InfiniteScroll
          handleNewPage={nextPage}
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
