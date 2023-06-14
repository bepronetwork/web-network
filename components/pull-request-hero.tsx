import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import ArrowLeft from "assets/icons/arrow-left";

import Avatar from "components/avatar";
import PriceConversor from "components/bounty/bounty-hero/price-conversor/controller";
import CustomContainer from "components/custom-container";
import DateLabel from "components/date-label";
import GithubInfo from "components/github-info";

import {useAppState} from "contexts/app-state";

import {pullRequest} from "interfaces/issue-data";

import { useNetwork } from "x-hooks/use-network";

interface IPullRequestHeroProps {
  currentPullRequest: pullRequest;
}

export default function PullRequestHero({currentPullRequest}: IPullRequestHeroProps) {
  const { t } = useTranslation(["common", "pull-request"]);
  
  const router = useRouter();
  
  const { state } = useAppState();
  const { getURLWithNetwork } = useNetwork();

  return (
    <div className="banner-shadow">
      <CustomContainer>
        <div className="d-flex flex-row">
          <div className="col-10 row">
            <div className="d-flex flex-row">
              <div
                className="me-2 cursor-pointer"
                onClick={() => router.push(getURLWithNetwork("/bounty", {
                  id: state.currentBounty?.data?.githubId,
                  repoId: state.currentBounty?.data?.repository_id,
                }))}
              >
                <ArrowLeft
                  width={16}
                  height={16}
                  className="border rounded-circle border-primary p-1"
                />
              </div>
              <div>
                <span className="me-2 text-white-40 caption-large">
                  #{state.currentBounty?.data?.githubId}
                </span>
                <span className="text-gray caption-medium">
                  {state.currentBounty?.data?.title}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-2">
              <h4>{t("pull-request:title")}</h4>
              <h4 className="text-white-40">#{currentPullRequest?.githubId}</h4>
            </div>

            <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-2">
              <div className="d-flex align-items-center">
                <Avatar
                  className="me-2"
                  userLogin={currentPullRequest?.githubLogin}
                />{" "}
                <GithubInfo
                  parent="hero"
                  variant="user"
                  label={["@", currentPullRequest?.githubLogin].join("")}
                />
              </div>

              {currentPullRequest?.createdAt && (
                <DateLabel
                  date={currentPullRequest?.createdAt}
                  className="text-white"
                />
              )}
            </div>
          </div>

          <div className="col-2 d-flex align-items-center justify-content-center">
            <PriceConversor
              currentValue={state.currentBounty?.data?.amount}
              currency={state.currentBounty?.data?.transactionalToken?.symbol || t("misc.token")}
            />
          </div>
        </div>
      </CustomContainer>
    </div>
  );
}
