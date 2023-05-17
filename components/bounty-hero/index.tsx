import {isMobile} from "react-device-detect";

import {useTranslation} from "next-i18next";

import Avatar from "components/avatar";
import Badge from "components/badge";
import CountInfo from "components/bounty-hero/count-info";
import BountyStatusInfo from "components/bounty-status-info";
import BountyTags from "components/bounty/bounty-tags";
import CustomContainer from "components/custom-container";
import DateLabel from "components/date-label";
import GithubInfo from "components/github-info";
import If from "components/If";
import PriceConversor from "components/price-conversor";
import Translation from "components/translation";

import {useAppState} from "contexts/app-state";

import {getIssueState} from "helpers/handleTypeIssue";
import {truncateAddress} from "helpers/truncate-address";

export default function BountyHero() {
  const {t} = useTranslation(["bounty", "common"]);

  const {state} = useAppState();

  function renderPriceConversor() {
    return (
    <div className={`${isMobile ? 'col-12 mt-2' : 'col-1' } d-flex align-items-center justify-content-center`}>
      <PriceConversor
        currentValue={state.currentBounty?.data?.amount?.toFixed() || "0"}
        currency={state.currentBounty?.data?.transactionalToken?.symbol || t("common:misc.token")}
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
              <h4 className="text-break">{state.currentBounty?.data?.title}</h4>
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
                    fundedAmount={state.currentBounty?.data?.fundedAmount}
                  />

                  {state.currentBounty?.data?.isKyc
                  ? <Badge
                    className={
                      `d-flex status caption-medium py-1 px-3 bg-transparent border border-gray-700 text-gray-300`}
                    label={t("bounty:kyc.label")}
                  /> : null}
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
                    <If condition={!!state.currentBounty?.data?.repository}>
                      <GithubInfo
                        parent="list"
                        variant="repository"
                        label={state.currentBounty?.data?.repository?.githubPath}
                      />
                    </If>
                  </span>

                  <span className="caption-small text-light-gray text-uppercase">
                    <Translation label={"branch"} />
                    <span className="text-primary">:{state.currentBounty?.data?.branch}</span>
                  </span>
                </div>

                <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-20">
                  <CountInfo 
                    type="working"
                    count={state.currentBounty?.data?.working?.length}
                  />

                  <CountInfo 
                    type="pull-requests"
                    count={state.currentBounty?.data?.pullRequests?.length}
                  />

                  <CountInfo 
                    type="proposals"
                    count={state.currentBounty?.data?.mergeProposals?.length}
                  />

                  <If condition={!!state.currentBounty?.data?.createdAt}>
                    <DateLabel
                      date={state.currentBounty?.data?.createdAt}
                      className="text-white"
                      />
                  </If>
                </div>

                <If condition={!!state.currentBounty?.data?.tags?.length}>
                  <div className="mt-3">
                    <BountyTags
                      tags={state.currentBounty?.data?.tags}
                    />
                  </div>
                </If>
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
