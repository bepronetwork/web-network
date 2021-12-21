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

type Filter = {
  label: string
  value: string
  emptyState: string
}

type FiltersByIssueState = Filter[]

export default function ListIssues({
  listIssues = [],
  className = 'col-md-10'
}: {
  listIssues: IssueData[]
  className?: string
}): JSX.Element {
  const {
    dispatch,
    state: { loading }
  } = useContext(ApplicationContext)
  const { t } = useTranslation('common')

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

  return (
    <CustomContainer>
      <div className="row">
        <div className="input-group mb-3">
          <span
            className="input-group-text rounded-4 "
            id="inputGroup-sizing-sm"
          >
            <SearchIcon />
          </span>

          <input
            type="text"
            className="form-control"
            aria-label="Sizing example input"
            aria-describedby="inputGroup-sizing-sm"
            placeholder="Search for a Bounty"
          />

          <button
            className="bg-black border-transparent pe-3"
            style={{
              borderTopRightRadius: '.5rem',
              borderBottomRightRadius: '.5rem'
            }}
          >
            <CloseIcon width={10} height={10} />
          </button>

          <div className="d-flex flex-row ms-3">
            <span className="mediumInfo mr-1 mt-2 text-white-50">sort by</span>
            <ReactSelect
              options={[
                { label: 'Newest' },
                { label: 'Highest Bounty' },
                { label: 'Oldest' },
                { label: 'Lowest Bounty' }
              ]}
            />
          </div>
          
          <Button transparent applyTextColor textClass="text-blue">
            Clear
          </Button>

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
