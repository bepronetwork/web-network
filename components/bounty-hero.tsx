import {useContext} from "react";
import { isMobile } from "react-device-detect";

import { useTranslation } from "next-i18next";

import Avatar from "components/avatar";
import GithubInfo from "components/github-info";

import { getIssueState } from "helpers/handleTypeIssue";
import { truncateAddress } from "helpers/truncate-address";

import {AppStateContext} from "../contexts/app-state";
import BountyStatusInfo from "./bounty-status-info";
import CustomContainer from "./custom-container";
import DateLabel from "./date-label";
import PriceConversor from "./price-conversor";
import Translation from "./translation";

export default function BountyHero() {
  const { t } = useTranslation(["bounty", "common"]);
  const {state} = useContext(AppStateContext);


  function renderPriceConversor() {
    return (
    <div className={`${isMobile ? 'col-12 mt-2' : 'col-1' } d-flex align-items-center justify-content-center`}>
      <PriceConversor
        currentValue={state.currentBounty?.data?.amount?.toFixed() || "0"}
        currency={state.currentBounty?.data?.token?.symbol || t("common:misc.token")}
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
              <h4 className="me-2 text-white-70">#{state.currentBounty?.data?.githubId}</h4>
              <h4>{state.currentBounty?.data?.title}</h4>
            </div>
            {!isMobile && (
              <>
                <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-20">
                  <BountyStatusInfo
                    issueState={getIssueState({
                      state: state.currentBounty?.data?.state,
                      amount: state.currentBounty?.data?.amount,
                      fundingAmount: state.currentBounty?.data?.fundingAmount,
                    })}
                  />

                  <div className="d-flex align-items-center">
                    <Avatar
                      className="me-2"
                      userLogin={state.currentBounty?.data?.creatorGithub}
                    />{" "}
                    <GithubInfo
                      parent="hero"
                      variant="user"
                      label={state.currentBounty?.data?.creatorGithub ?
                        ["@", state.currentBounty?.data?.creatorGithub].join("")
                        :
                        truncateAddress(state.currentBounty?.data?.creatorAddress)
                      }
                    />
                  </div>

                  <span className="caption-small">
                    {(state.currentBounty?.data?.repository && (
                      <GithubInfo
                        parent="list"
                        variant="repository"
                        label={state.currentBounty?.data?.repository?.githubPath}
                      />
                    )) ||
                      ""}
                  </span>

                  <span className="caption-small text-light-gray text-uppercase">
                    <Translation label={"branch"} />
                    <span className="text-primary">:{state.currentBounty?.data?.branch}</span>
                  </span>
                </div>

                <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-20">
                  <div>
                    <span className="caption-small mr-1 text-white">
                      {state.currentBounty?.data?.working?.length || 0}
                    </span>
                    <span className="caption-small text-white-40 text-uppercase">
                      {t("info.working")}
                    </span>
                  </div>

                  <div>
                    <span className="caption-small mr-1 text-white">
                      {state.currentBounty?.data?.pullRequests?.length || 0}
                    </span>
                    <span className="caption-small text-white-40 text-uppercase">
                      {t("info.pull-requests", {count: state.currentBounty?.data?.pullRequests?.length})}
                    </span>
                  </div>

                  <div>
                    <span className="caption-small mr-1 text-white">
                      {state.currentBounty?.data?.mergeProposals?.length || 0}
                    </span>
                    <span className="caption-small text-white-40 text-uppercase">
                      {t("info.proposals", {count: state.currentBounty?.data?.mergeProposals?.length})}
                    </span>
                  </div>

                  {state.currentBounty?.chainData?.creationDate && (
                    <DateLabel
                      date={state.currentBounty?.chainData?.creationDate}
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
