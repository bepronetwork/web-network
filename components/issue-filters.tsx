import IssueFilterBox from '@components/issue-filter-box';
import React from 'react';
import useFilters from '@x-hooks/use-filters';

export default function IssueFilters() {
  const [[repoOptions, stateOptions, timeOptions], updateOptions] = useFilters();

  return <>
    <IssueFilterBox title="timeframe" options={timeOptions} onChange={(opt, checked) => updateOptions(timeOptions, opt, checked, 'time')} />
    <IssueFilterBox title="issue state" options={stateOptions} onChange={(opt, checked) => updateOptions(stateOptions, opt, checked, 'state')} />
    <IssueFilterBox title="repository" options={repoOptions} onChange={(opt, checked) => updateOptions(repoOptions, opt, checked, 'repo')} />
    </>
}
