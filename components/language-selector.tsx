import {OverlayTrigger, Popover} from 'react-bootstrap';
import React, {useState} from 'react';
import {useRouter} from 'next/router';

export default function LanguageSelector() {
  const {locale, pathname, asPath, push,} = useRouter();
  const [show, setShow] = useState(false);

  function changeLocale(locale: string) {
    return push(pathname, asPath, {locale});
  }

  function makeOption(label: string, value: string) { return ({value, label}); }
  const options = [
    makeOption(`English`, `en`),
    makeOption(`Português`, `pt`),
  ];

  const overlay =
    <Popover id="language-selector">
      <Popover.Body className="bg-shadow">
        {options.map(({value, label}) =>
                       <div key={label} onClick={() => changeLocale(value)} className={`${locale === value ? `active` : `cursor-pointer`}`}>{label}</div>)}
      </Popover.Body>
    </Popover>

  return <OverlayTrigger trigger="click"
                         overlay={overlay}
                         rootClose={true}
                         show={show}
                         onToggle={(n) => setShow(n) }
                         placement="auto">
    <span className="caption-small fs-7 text-white cursor-pointer">{locale.toUpperCase()}</span>
  </OverlayTrigger>
}
