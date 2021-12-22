import { GetStaticProps } from 'next'
import React, { useContext, useState } from 'react'
import IssueListItem from '@components/issue-list-item'
import { IssueData } from '@interfaces/issue-data'
import CustomContainer from './custom-container'
import NothingFound from './nothing-found'
import { ApplicationContext } from '@contexts/application'
import InternalLink from './internal-link'
import { useTranslation } from 'next-i18next'
import CloseIcon from '@assets/icons/close-icon'
import ReactSelect from './react-select'
import Button from './button'
import IssueFilters from './issue-filters'
import SearchIcon from '@assets/icons/search-icon'
import { FormControl, InputGroup } from 'react-bootstrap'

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
  const { t } = useTranslation('common')
  const [search, setSearch] = useState('')

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
        <div className="col-7 m-0">
          <InputGroup>
            <InputGroup.Text className="rounded-8">
              <SearchIcon />
            </InputGroup.Text>

            <FormControl
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-8 p-2"
              placeholder="Search for a Bounty"
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

        <div className="col-3 p-0 m-0 d-flex align-items-center pr-1">
          <span className="caption-small text-white-50 mr-1">sort by</span>

          <ReactSelect
            options={[
              { label: 'Newest' },
              { label: 'Highest Bounty' },
              { label: 'Oldest' },
              { label: 'Lowest Bounty' }
            ]}
          />
        </div>

        <div className="col-2 py-0 pl-0 pr-1 m-0">
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
