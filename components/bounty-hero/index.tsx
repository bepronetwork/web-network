import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { isMobile } from "react-device-detect";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import Avatar from "components/avatar";
import BountyItemLabel from "components/bounty-item-label";
import BountyStatusInfo from "components/bounty-status-info";
import BountyTags from "components/bounty/bounty-tags";
import CustomContainer from "components/custom-container";
import If from "components/If";
import PriceConversor from "components/price-conversor";

import { useAppState } from "contexts/app-state";

import { getIssueState } from "helpers/handleTypeIssue";
import { truncateAddress } from "helpers/truncate-address";

import BountySettings from "./bounty-settings";

export default function BountyHero({
  handleEditIssue,
  isEditIssue,
}: {
  handleEditIssue?: () => void;
  isEditIssue?: boolean;
}) {
  const router = useRouter();
  const { t } = useTranslation(["bounty", "common"]);

  const { state } = useAppState();
  const { network } = router.query;
  const currentState = getIssueState({
    state: state.currentBounty?.data?.state,
    amount: state.currentBounty?.data?.amount,
    fundingAmount: state.currentBounty?.data?.fundingAmount,
  });

  function renderPriceConversor() {
    return (
      <PriceConversor
        currentValue={state.currentBounty?.data?.amount?.toFixed() || "0"}
        currency={
          state.currentBounty?.data?.transactionalToken?.symbol ||
          t("common:misc.token")
        }
      />
    );
  }

  return (
    <div className="banner-shadow">
      <CustomContainer>
        <div className="d-flex flex-row">
          <div className="col-12">
            <div className="d-flex justify-content-between">
              <div>
                <span className="me-1 text-white-30 text-uppercase">
                  {network} /
                </span>
                <span className="text-break">
                  {state.currentBounty?.data?.githubId}
                </span>
              </div>
              <div className="">
                <BountySettings
                  handleEditIssue={handleEditIssue}
                  isEditIssue={isEditIssue}
                />
              </div>
            </div>

            <div className="d-flex justify-content-between border-top border-gray-850 mt-3">
              <div className="d-flex d-inline-flex align-items-center mt-3">
                <div
                  className={`d-flex py-1 px-2 bg-transparent border border-gray-700 text-gray-300 border-radius-4`}
                >
                  <div className="d-flex flex-column justify-content-center">
                    <BountyStatusInfo
                      issueState={currentState}
                      fundedAmount={state.currentBounty?.data?.fundedAmount}
                    />
                  </div>
                  <span className="ms-1 text-white">
                    {currentState?.charAt(0)?.toUpperCase() +
                      currentState?.slice(1)}
                  </span>
                </div>

                {!state.currentBounty?.data?.isKyc ? (
                  <OverlayTrigger
                    key="bottom-githubPath"
                    placement="bottom"
                    overlay={
                      <Tooltip id={"tooltip-bottom"}>
                        {t("bounty:kyc.bounty-tool-tip")}
                      </Tooltip>
                    }
                  >
                    <div
                      className={`ms-3 d-flex py-1 px-2 bg-transparent border 
                                  border-gray-700 text-white border-radius-4`}
                    >
                      {t("bounty:kyc.label")}
                    </div>
                  </OverlayTrigger>
                ) : null}
              </div>
              <div>{renderPriceConversor()}</div>
            </div>
            <h5 className="mt-3 break-title">
              {state.currentBounty?.data?.title}
            </h5>
            <If condition={!!state.currentBounty?.data?.tags?.length}>
              <div className="mt-3 border-bottom border-gray-850 pb-4">
                <BountyTags tags={state.currentBounty?.data?.tags} />
              </div>
            </If>
            {!isMobile && (
              <>
                <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-20">
                  <If condition={!!state.currentBounty?.data?.repository}>
                    <BountyItemLabel label={t("common:misc.repository")}>
                      <span className={`text-gray me-2 text-truncate`}>
                        {
                          state.currentBounty?.data?.repository?.githubPath.split("/")?.[0]
                        }
                      </span>
                    </BountyItemLabel>
                  </If>

                  <BountyItemLabel label={t("common:misc.branch")}>
                    <span className={`text-gray me-2 text-truncate`}>
                      {state.currentBounty?.data?.branch}
                    </span>
                  </BountyItemLabel>

                  <BountyItemLabel label={t("info.working")}>
                    <span className={`text-gray me-2 text-truncate`}>
                      {state.currentBounty?.data?.working?.length}
                    </span>
                  </BountyItemLabel>
                </div>

                <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-20">
                  <div className="d-flex align-items-center">
                    <BountyItemLabel label={t("common:misc.owner")}>
                      <>
                        <div className="d-flex flex-column justify-content-center">
                          <Avatar
                            size="xsm"
                            className="me-2"
                            userLogin={state.currentBounty?.data?.creatorGithub}
                          />{" "}
                        </div>
                        <span>
                          {state.currentBounty?.data?.creatorGithub
                            ? state.currentBounty?.data?.creatorGithub
                            : truncateAddress(state.currentBounty?.data?.creatorAddress)}
                        </span>
                      </>
                    </BountyItemLabel>
                  </div>
                  <If condition={!!state.currentBounty?.data?.createdAt}>
                    <BountyItemLabel
                      label={t("common:misc.opened-on")}
                      className=".d-md-none .d-lg-block"
                    >
                      <span className="text-gray text-truncate">
                        {state.currentBounty?.data?.createdAt?.toLocaleDateString("PT")}
                      </span>
                    </BountyItemLabel>
                  </If>
                </div>
              </>
            )}
          </div>
        </div>
      </CustomContainer>
    </div>
  );
}
