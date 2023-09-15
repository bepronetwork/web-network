import { useTranslation } from "next-i18next";

import ArrowLeft from "assets/icons/arrow-left";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import PriceConversor from "components/bounty/bounty-hero/price-conversor/controller";
import CustomContainer from "components/custom-container";
import DateLabel from "components/date-label";

import { truncateAddress } from "helpers/truncate-address";

import { Deliverable, IssueBigNumberData } from "interfaces/issue-data";

import PullRequestLabels from "../labels/controller";

interface DeliverableHeroViewProps {
  currentDeliverable: Deliverable;
  currentBounty: IssueBigNumberData;
  handleBack: () => void;
}

export default function DeliverableHeroView({
  currentDeliverable,
  currentBounty,
  handleBack,
}: DeliverableHeroViewProps) {
  const { t } = useTranslation(["common", "deliverable"]);

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
                  <h4>{t("deliverable:title")}</h4>

                  <h4 className="text-white-40">
                    #{currentDeliverable?.id}
                  </h4>
                </div>

                <div className="my-2">
                  <PullRequestLabels
                    merged={currentDeliverable?.accepted}
                    isMergeable={!currentDeliverable?.canceled && currentDeliverable?.markedReadyForReview}
                    isDraft={!currentDeliverable?.canceled && !currentDeliverable?.markedReadyForReview}
                  />
                </div>
              </div>

              <div className="col-sm-6">
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
            <div><h4 className="text-truncate">{currentDeliverable?.title}</h4></div>
          </div>

          <div className="col row">
            <div className="d-flex flex-wrap-reverse justify-content-start align-items-center mt-2">
            <div className="d-flex align-items-center my-2 me-2">
                <div className="me-2">
                  <AvatarOrIdenticon
                    address={currentDeliverable?.user?.address}
                    user={currentDeliverable?.user?.githubLogin}
                  />
                </div>{" "}
                <div
                  className={`text-uppercase text-white border border-gray-700 p-1 
                              border-radius-4 caption text-truncate`}
                >
                  {currentDeliverable.user?.githubLogin
                    ? currentDeliverable.user?.githubLogin
                    : truncateAddress(currentDeliverable.user?.address)}
                </div>
              </div>

              {currentDeliverable?.createdAt && (
                <DateLabel
                  date={currentDeliverable?.createdAt}
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
