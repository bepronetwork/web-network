import { isMobile } from "react-device-detect";

import { useTranslation } from "next-i18next";

import Avatar from "components/avatar";
import GithubInfo from "components/github-info";

import { useIssue } from "contexts/issue";

import { getIssueState } from "helpers/handleTypeIssue";

import BountyStatusInfo from "./bounty-status-info";
import CustomContainer from "./custom-container";
import DateLabel from "./date-label";
import PriceConversor from "./price-conversor";
import Translation from "./translation";

export default function BountyHero() {
  const { t } = useTranslation(["bounty", "common"]);
  const { activeIssue, networkIssue } = useIssue();

  function renderPriceConversor() {
    return (
    <div className={`${isMobile ? 'col-12 mt-2' : 'col-1' } d-flex align-items-center justify-content-center`}>
      <PriceConversor
        currentValue={activeIssue?.amount || 0}
        currency={activeIssue?.token?.symbol || t("common:misc.token")}
      />
    </div>
    )
  }


  return (
    <div className="banner-shadow">
      <CustomContainer>
        <div className="d-flex flex-row">
          <div className="col-10 row">
            <div className="d-flex flex-row">
              <h4 className="me-2 text-white-70">#{activeIssue?.githubId}</h4>
              <h4>{activeIssue?.title}</h4>
            </div>
            {!isMobile && (
              <>
                <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-20">
                  <BountyStatusInfo
                    issueState={getIssueState({
                      state: activeIssue?.state,
                      amount: activeIssue?.amount,
                      fundingAmount: activeIssue?.fundingAmount,
                    })}
                  />

                  <div className="d-flex align-items-center">
                    <Avatar
                      className="me-2"
                      userLogin={activeIssue?.creatorGithub}
                    />{" "}
                    <GithubInfo
                      parent="hero"
                      variant="user"
                      label={["@", activeIssue?.creatorGithub].join("")}
                    />
                  </div>

                  <span className="caption-small">
                    {(activeIssue?.repository && (
                      <GithubInfo
                        parent="list"
                        variant="repository"
                        label={activeIssue?.repository?.githubPath}
                      />
                    )) ||
                      ""}
                  </span>

                  <span className="caption-small text-ligth-gray text-uppercase">
                    <Translation label={"branch"} />
                    <span className="text-primary">:{activeIssue?.branch}</span>
                  </span>
                </div>

                <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-20">
                  <div>
                    <span className="caption-small mr-1 text-white">
                      {activeIssue?.working?.length || 0}
                    </span>
                    <span className="caption-small text-white-40 text-uppercase">
                      {t("info.working")}
                    </span>
                  </div>

                  <div>
                    <span className="caption-small mr-1 text-white">
                      {activeIssue?.pullRequests?.length || 0}
                    </span>
                    <span className="caption-small text-white-40 text-uppercase">
                      {activeIssue?.pullRequests?.length === 1
                        ? t("info.pull-requests_one")
                        : t("info.pull-requests_other")}
                    </span>
                  </div>

                  <div>
                    <span className="caption-small mr-1 text-white">
                      {activeIssue?.mergeProposals?.length || 0}
                    </span>
                    <span className="caption-small text-white-40 text-uppercase">
                      {activeIssue?.mergeProposals?.length === 1
                        ? t("info.proposals_one")
                        : t("info.proposals_other")}
                    </span>
                  </div>

                  {networkIssue?.creationDate && (
                    <DateLabel
                      date={networkIssue?.creationDate}
                      className="text-white"
                    />
                  )}
                </div>
              </>
            )}
          </div>
          {!isMobile && (
            renderPriceConversor()
          )}
        </div>
          {isMobile && (
            renderPriceConversor()
          )}
      </CustomContainer>
    </div>
  );
}
