import {FormCheck} from 'react-bootstrap';
import {IssueFilterBoxParams} from '@interfaces/filters';
import {useState} from 'react';

export default function IssueFilterBox({title, options = [], onChange, type = "radio", className = ``, filterPlaceholder = ``}: IssueFilterBoxParams) {
  const [search, setSearch] = useState(``)

  function filterSearch({label}) {
    return label.search(search) > -1;
  }

  function getKey(title, value) { return title.replace(` `, ``).toLowerCase().concat(value) }

  return <div className={`border border-bottom-0 border-dark-gray rounded rounded-3 filter-box px-2 pt-2 bg-shadow ${className}`}>
    <div className={`text-uppercase smallCaption text-white mn-2 p-2 ${!filterPlaceholder && `pb-3` || ``} filter-header`}>{title}</div>
    {
      filterPlaceholder &&
      <div className="mt-3">
        <input value={search} onChange={(e) => setSearch(e?.target?.value)} type="text" className="form-control" placeholder={filterPlaceholder}/>
      </div> || ``
    }
    <div className={`bg-shadow mxn-2 px-2 border-bottom border-dark-gray rounded-bottom filter-content ${filterPlaceholder && `filter-search` || ``}`}>
      {options.filter(filterSearch).map(option => <FormCheck className="py-1" key={getKey(title, option.value)} name={title.replace(` `, ``)} type={type} label={option.label} id={getKey(title, option.value)} checked={option.checked} onChange={(e) => onChange(option, e.target.checked)} />)}
    </div>
  </div>
}
