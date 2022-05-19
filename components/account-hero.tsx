import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import GithubHandle from "components/github-handle";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";

import { formatNumberToCurrency } from "helpers/formatNumber";

export default function AccountHero() {
  const { t } = useTranslation(["common", "bounty"]);

  const [myBounties, setMyBounties] = useState<number[]>([]);

  const { service: DAOService } = useDAO();
  const { wallet } = useAuthentication();

  function loadBeproNetworkInformation() {
    if (!DAOService || !wallet?.address) return;

    const address = wallet?.address;

    DAOService.getBountiesOfAddress(address)
      .then(setMyBounties);
  }

  useEffect(loadBeproNetworkInformation, [
    DAOService,
    wallet?.address,
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
                      {formatNumberToCurrency(myBounties.length)}
                    </h4>
                    <span className="caption-small">
                      {t("bounty:label_other")}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">
                      {formatNumberToCurrency(+wallet?.balance?.oracles?.locked +
                          +wallet?.balance?.oracles?.delegatedByOthers ||
                          0)}
                    </h4>
                    <span className="caption-small">{t("$oracles")}</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">
                      {formatNumberToCurrency(wallet?.balance?.oracles?.delegatedToOthers || 0)}
                    </h4>
                    <span className="caption-small">
                      {t("heroes.delegated-oracles")}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">
                      {formatNumberToCurrency(+wallet?.balance?.oracles?.delegatedByOthers || 0)}
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
