import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import Avatar from "components/avatar";
import BountyItemLabel from "components/bounty-item-label";
import BountyStatusInfo from "components/bounty-status-info";
import PriceConversor from "components/bounty/bounty-hero/price-conversor/controller";
import Button from "components/button";
import CustomContainer from "components/custom-container";
import If from "components/If";
import OriginLinkWarningModal from "components/modals/origin-link-warning/view";

import { truncateAddress } from "helpers/truncate-address";

import { IssueBigNumberData, IssueState } from "interfaces/issue-data";

import BountyTagsView from "../bounty-tags/view";
import BountySettings from "./bounty-settings/controller";
interface BountyHeroProps {
  handleEditIssue?: () => void;
  isEditIssue?: boolean;
  isOriginModalVisible: boolean;
  bounty: IssueBigNumberData;
  updateBountyData: (updatePrData?: boolean) => void;
  showOriginModal: () => void;
  hideOriginModal: () => void;
  network: string | string[];
  currentState: IssueState;
}

export default function BountyHeroView({
  handleEditIssue,
  isEditIssue,
  bounty,
  updateBountyData,
  network,
  currentState,
  isOriginModalVisible,
  showOriginModal,
  hideOriginModal
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
      <CustomContainer>
        <div className="row d-flex flex-row justify-content-center">
          <div className="col-md-12 min-w-bounty-hero justify-content-center">
            <div className="d-flex justify-content-between">
              <div className="d-flex align-items-center">
                <span className="me-1 text-white-30 text-uppercase">
                  {network} /
                </span>
                <span className="text-break">
                  {bounty?.id}
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

            <div className="d-flex flex-wrap justify-content-between border-top border-gray-850 mt-3 pt-3">
              <div className="d-flex d-inline-flex align-items-center align-items-center">
                <div
                  className={`d-flex py-1 px-2 bg-transparent border border-gray-700 text-gray-300 border-radius-4`}
                >
                  <div className="d-flex flex-column justify-content-center">
                    <BountyStatusInfo
                      issueState={currentState}
                      fundedAmount={bounty?.fundedAmount}
                    />
                  </div>

                  <span className="ms-1 text-white text-capitalize">
                    {currentState}
                  </span>
                </div>

                <If condition={bounty?.isKyc}>
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
                </If>
              </div>

              <div>
                {renderPriceConversor()}
              </div>
            </div>

            <h5 className="mt-3 break-title">
              {bounty?.title}
            </h5>

            <If condition={!!bounty?.tags?.length}>
              <div className="mt-3 border-bottom border-gray-850 pb-4">
                <BountyTagsView tags={bounty?.tags} />
              </div>
            </If>

            <div 
              className={`py-3 gap-3 d-flex flex-wrap align-items-center border-top 
                border-gray-850 justify-content-md-start`}
            >
              <If condition={!!bounty?.origin}>
                <BountyItemLabel label={t("common:misc.origin")} className="col-12 col-sm-3 text-overflow-ellipsis">
                  <Button
                    transparent
                    onClick={showOriginModal}
                    className="p-0 m-0 font-weight-medium text-decoration-underline"
                    textClass="text-primary"
                  >
                    <span className="text-lowercase">
                      {bounty?.origin}
                    </span>
                  </Button>
                </BountyItemLabel>
              </If>

              <BountyItemLabel label={t("common:misc.type")} className="col-12 col-sm-auto">
                <span className={`text-truncate text-capitalize`}>
                  {bounty?.type}
                </span>
              </BountyItemLabel>

              <BountyItemLabel label={t("info.working")} className="col-12 col-sm-auto">
                <span className={`text-truncate`}>
                  {bounty?.working?.length}
                </span>
              </BountyItemLabel>

              <div className="d-flex align-items-center">
                <BountyItemLabel label={t("common:misc.owner")} className="col-12 col-sm-auto">
                  <>
                    <div className="d-flex flex-column justify-content-center">
                      <Avatar
                        size="xsm"
                        userLogin={bounty?.user?.githubLogin}
                      />{" "}
                    </div>

                    <span>
                      {bounty?.user?.githubLogin || truncateAddress(bounty?.user?.address)}
                    </span>
                  </>
                </BountyItemLabel>
              </div>

              <If condition={!!bounty?.createdAt}>
                <BountyItemLabel
                  label={t("common:misc.opened-on")}
                  className="col-12 col-sm-auto"
                >
                  <span className="text-truncate">
                    {bounty?.createdAt?.toLocaleDateString("PT")}
                  </span>
                </BountyItemLabel>
              </If>
            </div>
          </div>
        </div>
      </CustomContainer>

      <OriginLinkWarningModal
        show={isOriginModalVisible}
        originLink={bounty?.origin}
        onClose={hideOriginModal}
      />
    </div>
  );
}
