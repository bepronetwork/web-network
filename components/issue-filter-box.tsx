import {FormCheck} from 'react-bootstrap';
import {IssueFilterBoxParams} from '@interfaces/filters';

export default function IssueFilterBox({title, options = [], onChange, type = "radio"}: IssueFilterBoxParams) {

  function getKey(title, value) { return title.replace(` `, ``).toLowerCase().concat(value) }

  return <div className="border border-bottom-0 border-dark-gray rounded rounded-3 filter-box px-2 pt-2" style={{width: `294px`, backgroundColor: "#0D0F19"}}>
    <div className="text-uppercase smallCaption text-white pb-2 filter-header">{title}</div>
    <div className="bg-shadow mxn-2 px-2 border-bottom border-dark-gray rounded-bottom filter-content">
      {options.map(option => <FormCheck className="py-1" key={getKey(title, option.value)} name={title.replace(` `, ``)} type={type} label={option.label} id={getKey(title, option.value)} checked={option.checked} onChange={(e) => onChange(option, e.target.checked)} />)}
    </div>
  </div>
}
