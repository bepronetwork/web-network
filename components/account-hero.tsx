import { useContext, useEffect } from "react";

import { formatNumberToCurrency } from "helpers/formatNumber";
import { useTranslation } from "next-i18next";

import GithubHandle from "components/github-handle";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { changeMyIssuesState } from "contexts/reducers/change-my-issues";
import {
  changeOraclesParse,
  changeOraclesState
} from "contexts/reducers/change-oracles";

import { BeproService } from "services/bepro-service";

export default function AccountHero() {
  const { t } = useTranslation(["common", "bounty"]);

  const {
    dispatch,
    state: { myIssues }
  } = useContext(ApplicationContext);
  const { wallet, beproServiceStarted } = useAuthentication();

  function loadBeproNetworkInformation() {
    if (!beproServiceStarted || !wallet?.address) return;

    const address = wallet?.address;

    BeproService.network
      .getIssuesByAddress(address)
      .then((issuesList) => {
        dispatch(changeMyIssuesState(issuesList));
      })
      .then((_) => BeproService.network.getOraclesSummary(address))
      .then((oracles) => {
        dispatch(changeOraclesState(changeOraclesParse(address, oracles)));
      })
      .catch((e) => {
        console.error(e);
      });
  }

  useEffect(loadBeproNetworkInformation, [
    beproServiceStarted,
    wallet?.address
  ]);

  return (
    <div className="banner">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between">
                <h1 className="h2 mb-0">{t("heroes.my-account")}</h1>
                <GithubHandle />
              </div>
              <div className="row">
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">
                      {formatNumberToCurrency(myIssues.length || 0)}
                    </h4>
                    <span className="caption-small">
                      {t("bounty:label_other")}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">
                      {formatNumberToCurrency(
                        +wallet?.balance?.oracles?.tokensLocked +
                          +wallet?.balance?.oracles?.oraclesDelegatedByOthers ||
                          0
                      )}
                    </h4>
                    <span className="caption-small">{t("$oracles")}</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">
                      {formatNumberToCurrency(
                        wallet?.balance?.oracles?.delegatedToOthers || 0
                      )}
                    </h4>
                    <span className="caption-small">
                      {t("heroes.delegated-oracles")}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">
                      {formatNumberToCurrency(
                        +wallet?.balance?.oracles?.oraclesDelegatedByOthers || 0
                      )}
                    </h4>
                    <span className="caption-small">
                      {t("heroes.delegated-by-others")}
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
