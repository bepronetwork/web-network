import {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {changeMicroServiceReady} from '@reducers/change-microservice-ready';
import GithubMicroService from '@services/github-microservice';

export default function StatusBar() {
  const {dispatch, state: {microServiceReady}} = useContext(ApplicationContext);

  function initialize() {
    GithubMicroService.getHealth()
                      .then(state => dispatch(changeMicroServiceReady(state)));
  }

  function getIndicatorClasses() {
    return `d-inline-block me-2 rounded bg-${microServiceReady === null ? `warning` : microServiceReady ? `success` : `danger`}`
  }

  useEffect(initialize, []);

  return (<>
    <div className="position-fixed bg-dark bottom-0 w-100 px-3 py-1 d-flex" id="status-bar">
      <div className="d-flex align-items-center">
        <span className={getIndicatorClasses()} style={{height: `.5rem`, width: `.5rem`}} />
        <span className="text-uppercase fs-7">{microServiceReady === null ? `waiting` : microServiceReady ? `operational` : `network congestion`}</span>
        <div className="px-2">|</div>
        <div className="d-flex align-items-center">
          <p className="text-uppercase fs-7 mb-0 text-center family-regular text-gray">
            Bepro Network Services and BEPRO Token ($BEPRO) are not available in Excluded Jurisdictions. By accessing and using the interface you agree with our <a href="https://www.bepro.network/terms-and-conditions" className="text-decoration-none">{`Terms & Conditions`}</a>
          </p>
        </div>
      </div>
    </div>
  </>)

}
