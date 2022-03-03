import {useContext, useEffect, useState,} from 'react';
import {ApplicationContext} from '@contexts/application';
import {changeMicroServiceReady} from '@reducers/change-microservice-ready';
import ExternalLinkIcon from '@assets/icons/external-link-icon';
import useApi from '@x-hooks/use-api';
import {useTranslation} from 'next-i18next';
import Translation from '@components/translation';
import LanguageSelector from '@components/language-selector';

export default function StatusBar() {
  const {dispatch, state: {microServiceReady}} = useContext(ApplicationContext);
  const [ms, setMs] = useState(0);
  const {getHealth} = useApi();
  const {t} = useTranslation('common');

  function neverEndingUpdate() {
    const past = +new Date();
    getHealth()
      .then(state => {
        dispatch(changeMicroServiceReady(state))
        setMs(+new Date() - past);
        setTimeout(neverEndingUpdate, 60 * 1000)
      })
  }

  function renderNetworkStatus() {
    let info;

    if (microServiceReady === null)
      info = [`white-50`, t('status.waiting')];
    else if (microServiceReady === false)
      info = [`danger`, t('status.network-problems')]
    else
      info = ms <= 200 ? [`success`, t('status.operational')] : ms <= 500 ? [`warning`, t('status.network-congestion')] : [`orange`, t('status.network-congestion')];

    const indicatorStyle = {height: `.5rem`, width: `.5rem`};
    const indicatorClass = `d-inline-block me-2 rounded bg-${info[0]}`

    return <a className="text-decoration-none text-white-50" href="https://bepronetwork.statuspage.io/" target="_blank">
      <span className={indicatorClass} style={indicatorStyle} />
      <span className="caption-small">{info[1]} {ms}ms</span>
    </a>
  }

  useEffect(neverEndingUpdate, []);

  return (<>
    <div className="position-fixed bg-shadow bottom-0 w-100 px-3 py-1 d-flex" id="status-bar">
      <div className="d-flex align-items-center w-100">
        {renderNetworkStatus()}
        <div className="ms-3 text-gray">|</div>
        <div className="ms-3 flex-grow-1 text-center text-uppercase family-Regular status-bar-text text-ligth-gray">
          <Translation label="status.tagline" />
          <a href="https://www.bepro.network/terms-and-conditions" target="_blank" className="ms-2 text-decoration-none text-primary"><Translation label="status.terms-and-conditions"/></a>
        </div>
        <LanguageSelector />
        <div className="ms-3 text-gray">|</div>
        <a className="ms-3 text-decoration-none caption-small text-white" target="_blank" href="https://support.bepro.network/"><Translation label="status.support" /> <ExternalLinkIcon className="ml-1" height={11} width={11} color="text-white"/></a>
      </div>
    </div>
  </>)

}
