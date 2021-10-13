import IssueFilterBox from '@components/issue-filter-box';
import React, {useEffect, useRef, useState} from 'react';
import useFilters from '@x-hooks/use-filters';
import Button from '@components/button';
import FilterIcon from '@assets/icons/filter-icon';

export default function IssueFilters() {
  const node = useRef()
  const [show, setShow] = useState(true);
  const [[repoOptions, stateOptions, timeOptions], updateOptions] = useFilters();

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

  useEffect(loadOutsideClick, [show]);

  return <div className="position-relative d-flex justify-content-end" ref={node}>
    <Button color="outline-dark bg-blue-hover" className={show && `border-blue` || ``} onClick={() => setShow(!show)}><FilterIcon/> <span>Filters</span></Button>
    <div className={`filter-wrapper d-${show ? `flex` : `none`} justify-content-start align-items-stretch position-absolute`}>
      <div>
        <IssueFilterBox className="h-100" title="repository" options={repoOptions} filterPlaceholder="Search repositories"
                        onChange={(opt, checked) => updateOptions(repoOptions, opt, checked, 'repo')}/>
      </div>
      <div>
        <IssueFilterBox title="timeframe" options={timeOptions}
                        onChange={(opt, checked) => updateOptions(timeOptions, opt, checked, 'time')}/>
        <IssueFilterBox title="issue state" options={stateOptions}
                        onChange={(opt, checked) => updateOptions(stateOptions, opt, checked, 'state')}/>
      </div>
    </div>
  </div>
}
