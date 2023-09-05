import { useTranslation } from "next-i18next";

import ArrowLeft from "assets/icons/arrow-left";

import Avatar from "components/avatar";
import PriceConversor from "components/bounty/bounty-hero/price-conversor/controller";
import CustomContainer from "components/custom-container";
import DateLabel from "components/date-label";
import GithubInfo from "components/github-info";

import { IssueBigNumberData, PullRequest } from "interfaces/issue-data";

import PullRequestLabels from "../labels/controller";

interface PullRequestHeroViewProps {
  currentPullRequest: PullRequest;
  currentBounty: IssueBigNumberData;
  handleBack: () => void;
}

export default function PullRequestHeroView({
  currentPullRequest,
  currentBounty,
  handleBack,
}: PullRequestHeroViewProps) {
  const { t } = useTranslation(["common", "pull-request"]);

  return (
    <div className="mt-3 pb-2 border-bottom border-gray-850">
      <CustomContainer>
        <div className="d-flex flex-row flex-column">
          <div className="col">
            <div className="d-flex">
              <div className="me-2 cursor-pointer" onClick={handleBack}>
                <ArrowLeft
                  width={16}
                  height={16}
                  className="border rounded-circle border-primary p-1"
                />
              </div>

              <div className="text-truncate">
                <span className="me-2 text-white-40 caption-large">
                  #{currentBounty?.id}
                </span>

                <span className="text-gray caption-medium">
                  {currentBounty?.title}
                </span>
              </div>
            </div>
          </div>

          <div className="col row">
            <div className="row d-flex flex-wrap justify-content-between">
              <div className="col d-flex flex-wrap align-items-center mt-3">
                <div className="d-inline-flex align-items-center justify-content-md-start gap-2 me-2">
                  <h4>{t("pull-request:title")}</h4>

                  <h4 className="text-white-40">
                    #{currentPullRequest?.githubId}
                  </h4>
                </div>

                <div className="my-2">
                  <PullRequestLabels
                    merged={currentPullRequest?.merged}
                    isMergeable={currentPullRequest?.isMergeable}
                    isDraft={currentPullRequest?.status === "draft"}
                  />
                </div>
              </div>

              <div className="col-6">
                <div className="d-flex flex-wrap justify-content-end">
                  <PriceConversor
                    currentValue={currentBounty?.amount}
                    currency={
                      currentBounty?.transactionalToken?.symbol ||
                      t("misc.token")
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col row">
            <div className="d-flex flex-wrap-reverse justify-content-start align-items-center mt-2">
              <div className="d-flex align-items-center my-2 me-2">
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
        </div>
      </CustomContainer>
    </div>
  );
}
