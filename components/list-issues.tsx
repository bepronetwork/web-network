import React, { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { FormControl, InputGroup } from 'react-bootstrap'

import CloseIcon from '@assets/icons/close-icon'
import SearchIcon from '@assets/icons/search-icon'

import ReactSelect from '@components/react-select'
import NothingFound from '@components/nothing-found'
import InternalLink from '@components/internal-link'
import IssueFilters from '@components/issue-filters'
import IssueListItem from '@components/issue-list-item'
import CustomContainer from '@components/custom-container'

import { ApplicationContext } from '@contexts/application'

import { IssueData } from '@interfaces/issue-data'

type Filter = {
  label: string
  value: string
  emptyState: string
}

type FiltersByIssueState = Filter[]

export default function ListIssues({
  listIssues = [],
  className = 'col-md-10',
  handleSearch = (search: string) => {}
}: {
  listIssues: IssueData[]
  className?: string
  handleSearch?: (search: string) => void
}): JSX.Element {
  const {
    dispatch,
    state: { loading }
  } = useContext(ApplicationContext)
  const { t } = useTranslation(['common', 'bounty'])
  const [search, setSearch] = useState('')
  const router = useRouter()
  const { state, time, repoId } = router.query

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
  }

  return (
    <CustomContainer>
      <div className="row mb-3 align-items-center list-actions">
        <div className={`col-${(hasFilter() && '7') || '8'} m-0`}>
          <InputGroup>
            <InputGroup.Text className="rounded-8">
              <SearchIcon />
            </InputGroup.Text>

            <FormControl
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-8 p-2"
              placeholder={t('bounty:search')}
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
            <span className="caption-small text-white-50 mr-1">{t('sort.label')}</span>

            <ReactSelect
              defaultValue={{ value: 'newest', label: t('sort.types.newest') }}
              options={[
                { value: 'newest', label: t('sort.types.newest') },
                { value: 'highest-bounty', label: t('sort.types.highest-bounty') },
                { value: 'oldest', label: t('sort.types.oldest') },
                { value: 'lowest-bounty', label: t('sort.types.lowest-bounty') }
              ]}
            />
          </div>

          <IssueFilters />
        </div>
      </div>

      {listIssues?.length === 0 && !loading.isLoading ? (
        <NothingFound description={filterByState.emptyState}>
          <InternalLink
            href="/create-bounty"
            label={String(t('actions.create-one'))}
            uppercase
          />
        </NothingFound>
      ) : null}

      {listIssues?.map((issue) => (
        <div key={issue.githubId}>
          <IssueListItem issue={issue} />
        </div>
      ))}
    </CustomContainer>
  )
}
