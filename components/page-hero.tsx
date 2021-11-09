import { GetStaticProps } from "next";
import {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {formatNumberToCurrency} from 'helpers/formatNumber'
import {BeproService} from '@services/bepro-service';

export default function PageHero({title = "Find issues to work",}) {

  const {state: {beproInit}} = useContext(ApplicationContext)
  const [inProgress, setInProgress] = useState(0)
  const [closed, setClosed] = useState(0)
  const [onNetwork, setOnNetwork] = useState(0)

  function loadTotals() {
    if (!beproInit)
      return;


    BeproService.getClosedIssues().then(setClosed);
    BeproService.getOpenIssues().then(setInProgress);
    BeproService.getTokensStaked().then(setOnNetwork);

  }

  useEffect(loadTotals, [beproInit]);

  return (
    <div className="banner bg-bepro-blue mb-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex flex-column">
              <h1 className="h1 mb-0">{title}</h1>
              <div className="row">
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">{inProgress}</h4>
                    <span className="smallCaption">In progress</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">{closed}</h4>
                    <span className="smallCaption">Issues closed</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="top-border">
                    <h4 className="h4 mb-0">
                      {formatNumberToCurrency(onNetwork)}{" "}
                      <span className="smallCaption trans">$BEPRO</span>
                    </h4>
                    <span className="smallCaption">Bounties in the Network</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
