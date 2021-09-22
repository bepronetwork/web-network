import {useContext, useEffect, useState,} from 'react';
import {ApplicationContext} from '@contexts/application';
import {changeMicroServiceReady} from '@reducers/change-microservice-ready';
import GithubMicroService from '@services/github-microservice';
import ExternalLinkIcon from '@assets/icons/external-link-icon';

export default function StatusBar() {
  const {dispatch, state: {microServiceReady}} = useContext(ApplicationContext);
  const [ms, setMs] = useState(0);

  function neverEndingUpdate() {
    const past = +new Date();
    GithubMicroService.getHealth()
                      .then(state => {
                        dispatch(changeMicroServiceReady(state))
                        setMs(+new Date() - past);
                        setTimeout(neverEndingUpdate, 60*1000)
                      })
  }

  function renderNetworkStatus() {
    let info;

    if (microServiceReady === null)
      info = [`white-50`, `waiting`];
    else if (microServiceReady === false)
      info = [`danger`, `network problems`]
    else
      info = ms <= 200 ? [`success`, `operational`] : ms <= 500 ? [`warning`, `network congestion`] : [`orange`, `network congestion`];

    const indicatorStyle = {height: `.5rem`, width: `.5rem`};
    const indicatorClass = `d-inline-block me-2 rounded bg-${info[0]}`

    return <a className="text-decoration-none text-white-50" href="https://bepronetwork.statuspage.io/" target="_blank">
      <span className={indicatorClass} style={indicatorStyle} />
      <span className="text-uppercase fs-7">{info[1]} {ms}ms</span>
    </a>
  }

  useEffect(neverEndingUpdate, []);

  return (<>
    <div className="position-fixed bg-dark bottom-0 w-100 px-3 py-1 d-flex" id="status-bar">
      <div className="d-flex align-items-center w-100">
        {renderNetworkStatus()}
        <div className="ms-3">|</div>
        <div className="ms-3 flex-grow-1 text-center fs-7 text-uppercase family-Regular text-ligth-gray">
          Bepro Network Services and BEPRO Token ($BEPRO) are not available in Excluded Jurisdictions. By accessing and using the interface you agree with our <a href="https://www.bepro.network/terms-and-conditions" target="_blank" className="text-decoration-none text-blue">{`Terms & Conditions`}</a>
        </div>
        <div className="ms-3">|</div>
        <a className="ms-3 text-decoration-none smallCaption fs-7 text-white" target="_blank" href="https://support.bepro.network/">support <ExternalLinkIcon className="ml-1" height={11} width={11} color="text-white"/></a>
      </div>
    </div>
  </>)

}
