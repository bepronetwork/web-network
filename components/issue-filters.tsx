import IssueFilterBox from '@components/issue-filter-box';
import React, {useEffect, useRef, useState} from 'react';
import useFilters from '@x-hooks/use-filters';
import Button from '@components/button';
import FilterIcon from '@assets/icons/filter-icon';
import { useRouter } from 'next/router';
import Translation from './translation';
import { useTranslation } from 'next-i18next';

export default function IssueFilters() {
  const node = useRef()
  const [show, setShow] = useState(false);
  const [[repoOptions, stateOptions, timeOptions], updateOptions, clearFilters] = useFilters();
  const router = useRouter();
  const { state, time, repoId } = router.query
  const { t } = useTranslation('common')

  function countFilters() {
    return +!!state + +!!time + +!!repoId
  }

  function countFiltersLabel() {
    const quantity = countFilters()

    if (quantity > 0)
      return <div className='mr-1 bg-primary rounded-4 p-1 myn-1'>{quantity}</div>

    return <FilterIcon />
  }

  function handleClick(e) {
    // @ts-ignore
    if (node.current.contains(e.target))
      return;

    setShow(false);
  }

  function loadOutsideClick() {
    if (show)
      document.addEventListener(`mousedown`, handleClick)
    else
      document.removeEventListener(`mousedown`, handleClick)

    return () => document.removeEventListener(`mousedown`, handleClick)
  }

  function handleClearFilters() {
    clearFilters()
  }

  useEffect(loadOutsideClick, [show]);

  return <div className="position-relative d-flex justify-content-end" ref={node}>
    {countFilters() > 0 && <Button
            transparent
            applyTextColor
            textClass="text-primary"
            className="p-0 mr-2"
            onClick={handleClearFilters}
          >
            Clear
          </Button>}

    <Button color="black" className={`${show && `border-primary` || ``} rounded-8 m-0`} onClick={() => setShow(!show)}>{countFiltersLabel()} <span><Translation label="filters.filters" /></span></Button>
    
    <div className={`border border-dark-gray rounded rounded-3 filter-wrapper d-${show ? `flex` : `none`} justify-content-start align-items-stretch position-absolute`}>
      <div>
        <IssueFilterBox className="h-100 border border-right border-dark-gray" title={t('filters.repository')} options={repoOptions} filterPlaceholder={t('filters.search-repositories')}
                        onChange={(opt, checked) => updateOptions(repoOptions, opt, checked, 'repo')}/>
      </div>
      <div>
      <IssueFilterBox title={t('filters.bounties.title')} options={stateOptions}
                        onChange={(opt, checked) => updateOptions(stateOptions, opt, checked, 'state')}/>
        <IssueFilterBox title={t('filters.timeframe.title')} options={timeOptions}
                        onChange={(opt, checked) => updateOptions(timeOptions, opt, checked, 'time')}/>
      </div>
    </div>
  </div>
}
