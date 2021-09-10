import {useContext, useEffect, useState,} from 'react';
import {ApplicationContext} from '@contexts/application';
import {changeMicroServiceReady} from '@reducers/change-microservice-ready';
import GithubMicroService from '@services/github-microservice';

export default function StatusBar() {
  const {dispatch, state: {microServiceReady}} = useContext(ApplicationContext);
  const [ms, setMs] = useState(0);

  function neverEndingUpdate() {
    const past = +new Date();
    GithubMicroService.getHealth()
                      .then(state => dispatch(changeMicroServiceReady(state)))
                      .then(_ => setMs(+new Date() - past))
                      .then(_ => setTimeout(neverEndingUpdate, 60*1000));
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

    return <>
      <span className={indicatorClass} style={indicatorStyle} />
      <span className="text-uppercase fs-7">{info[1]} {ms}ms</span>
    </>
  }

  useEffect(neverEndingUpdate, []);

  return (<>
    <div className="position-fixed bg-dark bottom-0 w-100 px-3 py-1 d-flex" id="status-bar">
      <div className="d-flex align-items-center">
        {renderNetworkStatus()}
      </div>
      <div className="px-2">|</div>
      <div className="d-flex align-items-center">
        <p className="text-uppercase fs-7 mb-0 text-center family-regular ">
          Bepro Network Services and BEPRO Token ($BEPRO) are not available in Excluded Jurisdictions. By accessing and using the interface you agree with our <a href="https://www.bepro.network/terms-and-conditions" className="text-decoration-none">{`Terms & Conditions`}</a>
        </p>
      </div>
    </div>
  </>)

}
