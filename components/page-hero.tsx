import { GetStaticProps } from "next";
import {ReactElement, useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {formatNumberToCurrency} from 'helpers/formatNumber'
import {BeproService} from '@services/bepro-service';
import Translation from "@components/translation";
import useNetwork from "@x-hooks/use-network";
import { handleNetworkAddress } from "@helpers/custom-network";
import { formatTextToBold } from 'helpers/string'
interface PageHeroProps {
  title: string;
  subtitle?: string
}

export default function PageHero({ title, subtitle } : PageHeroProps) {

  const {state: {beproInit}} = useContext(ApplicationContext)
  const [inProgress, setInProgress] = useState(0)
  const [closed, setClosed] = useState(0)
  const [onNetwork, setOnNetwork] = useState(0)
  const { network } = useNetwork()

  function loadTotals() {
    if (!beproInit || !network)
      return;

    BeproService.getClosedIssues(handleNetworkAddress(network)).then(setClosed);
    BeproService.getOpenIssues(handleNetworkAddress(network)).then(setInProgress);
    BeproService.getTokensStaked(handleNetworkAddress(network)).then(setOnNetwork);

  }

  useEffect(loadTotals, [beproInit, network]);

  return (
    <div className="banner">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex flex-column">
              <h2>{title}</h2>
              {subtitle && (
                <span
                  className="caption-medium text-uppercase text-white-70 mt-2"
                  dangerouslySetInnerHTML={{
                    __html: formatTextToBold(subtitle),
                  }}
                />
              )}
              <div className="row">
                <div className="col-md-3">
                  <div className="top-border">
                    <h4>{inProgress}</h4>
                    <span className="caption-small">
                      <Translation label={"heroes.in-progress"} />
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="top-border">
                    <h4>{closed}</h4>
                    <span className="caption-small">
                      <Translation label={"heroes.bounties-closed"} />
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="top-border">
                    <h4>
                      {formatNumberToCurrency(onNetwork)}{" "}
                      <span className="caption-small trans">
                        <Translation label={"$bepro"} />
                      </span>
                    </h4>
                    <span className="caption-small">
                      <Translation label={"heroes.bounties-in-network"} />
                    </span>
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
