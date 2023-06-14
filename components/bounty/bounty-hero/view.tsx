import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import Avatar from "components/avatar";
import BountyItemLabel from "components/bounty-item-label";
import BountyStatusInfo from "components/bounty-status-info";
import PriceConversor from "components/bounty/bounty-hero/price-conversor/controller";
import If from "components/If";

import { truncateAddress } from "helpers/truncate-address";

import { IssueBigNumberData, IssueState } from "interfaces/issue-data";

import BountyTagsView from "../bounty-tags/view";
import BountySettings from "./bounty-settings/controller";
interface BountyHeroProps {
  handleEditIssue?: () => void;
  isEditIssue?: boolean;
  bounty: IssueBigNumberData;
  updateBountyData: (updatePrData?: boolean) => void;
  network: string | string[];
  currentState: IssueState;
}

export default function BountyHeroView({
  handleEditIssue,
  isEditIssue,
  bounty,
  updateBountyData,
  network,
  currentState
}: BountyHeroProps) {
  const { t } = useTranslation(["bounty", "common"]);

  function renderPriceConversor() {
    return (
      <PriceConversor
        currentValue={bounty?.amount}
        currency={
          bounty?.transactionalToken?.symbol ||
          t("common:misc.token")
        }
      />
    );
  }

  return (
    <div className="mt-2 border-bottom border-gray-850 pb">
      <div className="container">
        <div className="row d-flex flex-row justify-content-center">
          <div className="col-md-12 min-w-bounty-hero justify-content-center">
            <div className="d-flex justify-content-between">
              <div className="d-flex align-items-center">
                <span className="me-1 text-white-30 text-uppercase">
                  {network} /
                </span>
                <span className="text-break">
                  {bounty?.githubId}
                </span>
              </div>
              <div className="">
                <BountySettings
                  currentBounty={bounty}
                  updateBountyData={updateBountyData}
                  handleEditIssue={handleEditIssue}
                  isEditIssue={isEditIssue}
                />
              </div>
            </div>

            <div className="d-flex flex-wrap justify-content-between border-top border-gray-850 mt-3">
              <div className="d-flex d-inline-flex align-items-center mt-3">
                <div
                  className={`d-flex py-1 px-2 bg-transparent border border-gray-700 text-gray-300 border-radius-4`}
                >
                  <div className="d-flex flex-column justify-content-center">
                    <BountyStatusInfo
                      issueState={currentState}
                      fundedAmount={bounty?.fundedAmount}
                    />
                  </div>
                  <span className="ms-1 text-white">
                    {currentState?.charAt(0)?.toUpperCase() +
                      currentState?.slice(1)}
                  </span>
                </div>

                {bounty?.isKyc ? (
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
              <div className="mt-3">{renderPriceConversor()}</div>
            </div>
            <h5 className="mt-3 break-title">
              {bounty?.title}
            </h5>
            <If condition={!!bounty?.tags?.length}>
              <div className="mt-3 border-bottom border-gray-850 pb-4">
                <BountyTagsView tags={bounty?.tags} />
              </div>
            </If>
            <div className="my-3 pt-1 flex-wrap d-inline-flex align-items-center justify-content-md-start gap-20">
              <If condition={!!bounty?.repository}>
                <BountyItemLabel label={t("common:misc.repository")}>
                  <span className={`text-gray me-2 text-truncate`}>
                    {
                      bounty?.repository?.githubPath.split("/")?.[1]
                    }
                  </span>
                </BountyItemLabel>
              </If>
              <BountyItemLabel label={t("common:misc.branch")}>
                <span className={`text-gray me-2 text-truncate`}>
                  {bounty?.branch}
                </span>
              </BountyItemLabel>

              <BountyItemLabel label={t("info.working")}>
                <span className={`text-gray me-2 text-truncate`}>
                  {bounty?.working?.length}
                </span>
              </BountyItemLabel>

              <div className="d-flex align-items-center">
                <BountyItemLabel label={t("common:misc.owner")}>
                  <>
                    <div className="d-flex flex-column justify-content-center">
                      <Avatar
                        size="xsm"
                        className="me-2"
                        userLogin={bounty?.creatorGithub}
                      />{" "}
                    </div>
                    <span>
                      {bounty?.creatorGithub
                        ? bounty?.creatorGithub
                        : truncateAddress(bounty?.creatorAddress)}
                    </span>
                  </>
                </BountyItemLabel>
              </div>
              <If condition={!!bounty?.createdAt}>
                <BountyItemLabel
                  label={t("common:misc.opened-on")}
                  className=".d-md-none .d-lg-block"
                >
                  <span className="text-gray text-truncate">
                    {bounty?.createdAt?.toLocaleDateString("PT")}
                  </span>
                </BountyItemLabel>
              </If>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
