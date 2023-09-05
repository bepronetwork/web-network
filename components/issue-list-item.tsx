import React, { useEffect, useState } from "react";

import BigNumber from "bignumber.js";
import clsx from "clsx";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import ArrowUpRightGray from "assets/icons/arrow-up-right-gray";
import EyeIcon from "assets/icons/eye-icon";
import EyeSlashIcon from "assets/icons/eye-slash-icon";
import TrashIcon from "assets/icons/trash-icon";

import Badge from "components/badge";
import BountyItemLabel from "components/bounty-item-label";
import BountyStatusInfo from "components/bounty-status-info";
import BountyAmount from "components/bounty/amount-info/controller";
import CardItem from "components/card-item";
import { FlexColumn } from "components/common/flex-box/view";
import If from "components/If";
import Modal from "components/modal";
import ResponsiveWrapper from "components/responsive-wrapper";
import Translation from "components/translation";

import {useAppState} from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";

import { formatNumberToCurrency } from "helpers/formatNumber";
import {getIssueState} from "helpers/handleTypeIssue";

import {IssueBigNumberData, IssueState} from "interfaces/issue-data";

import useUpdateBountyVisibility from "x-hooks/api/network/use-update-bounty-visibility";
import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";

import BountyTagsView from "./bounty/bounty-tags/view";
import NetworkBadge from "./network/badge/view";
import MoreActionsDropdown from "./utils/more-actions-dropdown/controller";

interface IssueListItemProps {
  issue?: IssueBigNumberData;
  xClick?: () => void;
  size?: "sm" | "lg";
  variant?: "network" | "multi-network" | "management";
}

export default function IssueListItem({
  size = "lg",
  issue = null,
  xClick,
  variant = "network"
}: IssueListItemProps) {
  const router = useRouter();
  const { t } = useTranslation(["bounty", "common", "custom-network"]);
  
  const {state,dispatch} = useAppState();
  const [visible, setVisible] = useState<boolean>();
  const [isCancelable, setIsCancelable] = useState(false);
  const [hideTrashIcon, setHideTrashIcon] = useState<boolean>();
  const [showHardCancelModal, setShowHardCancelModal] = useState(false);
  const [isLoadingHardCancel, setIsLoadingHardCancel] = useState(false);
  
  const { getURLWithNetwork } = useNetwork();
  const { handleHardCancelBounty } = useBepro();

  const isVisible = visible !== undefined ? visible : issue?.visible;

  const issueState = getIssueState({
    state: issue?.state,
    amount: issue?.amount,
    fundingAmount: issue?.fundingAmount,
  });
  
  const fundedAmount = issue?.fundedAmount?.isNaN() ? BigNumber(0) : issue?.fundedAmount;
  const fundingAmount = issue?.fundingAmount?.isNaN() ? BigNumber(0) : issue?.fundingAmount;

  const percentage =
  BigNumber(fundedAmount.multipliedBy(100).toFixed(2, 1))
    .dividedBy(issue?.fundingAmount)
    .toFixed(0, 1) || 0;

  function handleClickCard() {
    if (xClick) return xClick();
    router.push(getURLWithNetwork("/bounty/[id]", {
      id: issue?.id,
      network: issue?.network?.name,
      chain: issue?.network?.chain?.chainShortName
    }));
  }

  function handleToastError(err?: string) {
    dispatch(addToast({
      type: "danger",
      title: t("common:actions.failed"),
      content: t("common:errors.failed-update-bounty")
    }));
    console.debug(t("common:errors.failed-update-bounty"), err);
  }

  async function handleHideBounty() {
    useUpdateBountyVisibility({
      id: issue?.id,
      networkAddress: issue?.network?.networkAddress,
      visible: !isVisible
    })
      .then(() => {
        dispatch(addToast({
          type: "success",
          title: t("common:actions.success"),
          content: t("bounty:actions.update-bounty")
        }));
        setVisible(!isVisible)
      })
      .catch(handleToastError);
  }

  function handleHardCancel() {
    setIsLoadingHardCancel(true)
    handleHardCancelBounty(issue?.contractId, issue?.id)
    .then(() => {
      dispatch(addToast({
        type: "success",
        title: t("common:actions.success"),
        content: t("bounty:actions.canceled-bounty")
      }));
      setShowHardCancelModal(false)
      setHideTrashIcon(true)
    }).catch(handleToastError)
    .finally(() => setIsLoadingHardCancel(false))
  } 

  useEffect(() => {
    if (state.Service?.active && issue && variant === "management")
      Promise.all([
        state.Service?.active.getCancelableTime(),
        state.Service?.active.getTimeChain()
      ])
        .then(([cancelableTime, chainTime]) => {
          const canceable = +new Date(chainTime) >= +new Date(+issue?.contractCreationDate + cancelableTime);
          setIsCancelable(canceable);
        })
        .catch(error => console.debug("Failed to get cancelable time", error));
  }, [state.Service?.active, issue]);

  function IssueTag() {
    const tag = issue?.network?.name;
    const id = issue?.id;

    return (
      <span className={clsx([
        "caption-small font-weight-normal",
        isVisible && "text-gray-500" || "text-decoration-line text-gray-600",
      ])}>
        {tag ? `${tag}-${id}` : `#${id}`}
      </span>
    );
  }

  function RenderIssueData({ state }: {state: IssueState}) {
    const types = {
      funding: {
        value: percentage,
        translation: t("info.funded")
      },
      open: {
        value: issue?.working?.length,
        translation: t("info.working"),
      },
      ready: {
        value: issue?.pullRequests?.length,
        translation: t("info.pull-requests", {
          count: issue?.pullRequests?.length,
        }),
      },
      proposal: {
        value: issue?.mergeProposals?.length,
        translation: t("info.proposals", {
          count: issue?.mergeProposals?.length,
        }),
      },
    };

    const lowerState = state?.toLowerCase();

    if (["open", "ready", "proposal", "funding"].includes(lowerState)) {
      const isFunding = lowerState === 'funding';
      const { value, translation } = types[lowerState];

      return (
        <BountyItemLabel label={translation} key={issue.id} className="col-auto">
          <span className={`${ isFunding ? 'text-light-warning': "text-gray"}`}>
            {value || 0}{isFunding && '%'}
          </span>
        </BountyItemLabel>
      );
    } else return <></>;
  }

  if (size === "sm") {
    const isSeekingFund = ["funding", "partial-funded"].includes(issueState);

    return (
      <CardItem onClick={handleClickCard} key="sm-card">
        <>
          <ResponsiveWrapper xs={false} md={true} className="d-flex gap-2 align-items-center justify-content-between">
            <div className="mw-50-auto network-name">
              <NetworkBadge
                logoUrl={issue?.network?.logoIcon && `${state.Settings?.urls?.ipfs}/${issue?.network?.logoIcon}`}
                name={issue?.network?.name}
              />
            </div>

            <div className="max-width-content">
              <Badge
                color="transparent"
                className={`d-flex align-items-center gap-1 border border-gray-800 caption-medium 
                  font-weight-normal text-capitalize border-radius-8`}
              >
                <>
                  <BountyStatusInfo issueState={issueState} />
                  <span>{isSeekingFund ? t("seeking-funding") : issueState}</span>
                </>
              </Badge>
            </div>
          </ResponsiveWrapper>

          <ResponsiveWrapper xs={true} md={false} className="align-items-center gap-2 mb-3">
            <BountyStatusInfo issueState={issueState} />
            <span className="text-truncate text-capitalize">{issue?.title}</span>
          </ResponsiveWrapper>


          <ResponsiveWrapper xs={false} md={true} className="mt-3 flex-column">
            <span className="text-white text-truncate text-capitalize">
              {issue?.title}
            </span>

            <span className="text-gray-600 text-truncate text-capitalize">
              {issue?.body}
            </span>
          </ResponsiveWrapper>

          <div className="row align-items-center justify-content-md-end justify-content-between mt-2">
            <If condition={isSeekingFund}>
              <ResponsiveWrapper 
                xs={false} 
                md={true} 
                className="col-6 caption-medium font-weight-normal text-capitalize"
              >
                <span className="mr-1">{t("info.funded")}</span>
                <span className="text-yellow-500">{formatNumberToCurrency(issue?.fundedPercent)}%</span>
              </ResponsiveWrapper>
            </If>

            <ResponsiveWrapper 
              md={false}
              className="mw-50-auto network-name caption-medium font-weight-normal text-capitalize"
            >
              <NetworkBadge
                logoUrl={issue?.network?.logoIcon && `${state.Settings?.urls?.ipfs}/${issue?.network?.logoIcon}`}
                name={issue?.network?.name}
              />
            </ResponsiveWrapper>

            <div className="col-6">
              <BountyAmount bounty={issue} size={size} />
            </div>
          </div>
        </>
      </CardItem>
    );
  }

  if (variant === "management") {
    return (
      <>
      <CardItem
        variant="management"
        hide={!isVisible}
        key="management"
      >
        <div className="row align-items-center">
          <div className="col col-md-6 text-overflow-ellipsis">
            <span className={`text-capitalize
              ${!isVisible && "text-decoration-line text-gray-600" || "text-gray-white"}`}>
              {(issue?.title !== null && issue?.title) || (
                <Translation ns="bounty" label={"errors.fetching"} />
              )}
            </span>
            <div className={!isVisible && 'text-decoration-line' || ""}>
              <IssueTag />
            </div>
          </div>

          <ResponsiveWrapper xs={false} md={true} className="col-2 d-flex justify-content-center">
            <FlexColumn className="justify-content-center">
              <div
                className="cursor-pointer"
                onClick={handleClickCard}
              >
                <ArrowUpRightGray />
              </div>
            </FlexColumn>
          </ResponsiveWrapper>

          <ResponsiveWrapper xs={false} md={true} className="col-2 d-flex justify-content-center">
            <FlexColumn className="justify-content-center">
                <div className="cursor-pointer" onClick={handleHideBounty}>
                  {isVisible ? <EyeIcon /> : <EyeSlashIcon />}
                </div>
            </FlexColumn>
          </ResponsiveWrapper>

          <ResponsiveWrapper xs={false} md={true} className="col-2 d-flex justify-content-center">
            <FlexColumn className="justify-content-center">
              {!hideTrashIcon && isCancelable && !['canceled', 'closed', 'proposal'].includes(issue?.state) ? (
              <div className="cursor-pointer m-0 p-0" onClick={() => setShowHardCancelModal(true)}>
                <TrashIcon />
              </div>
              ): '-'}
            </FlexColumn>
          </ResponsiveWrapper>

          <ResponsiveWrapper xs={true} md={false} className="col-auto d-flex justify-content-center">
            <MoreActionsDropdown
              actions={[
                { content: "Bounty Link", onClick: handleClickCard},
                { content: isVisible ? "Hide Bounty" : "Show Bounty", onClick: handleHideBounty},
                { content: "Cancel", onClick: () => setShowHardCancelModal(true)},
              ]}
            />
          </ResponsiveWrapper>
        </div>
      </CardItem>
      <Modal
            title={t("common:modals.hard-cancel.title")}
            centerTitle
            show={showHardCancelModal}
            onCloseClick={() => setShowHardCancelModal(false)}
            cancelLabel={t("common:actions.close")}
            okLabel={t("common:actions.continue")}
            isExecuting={isLoadingHardCancel}
            okDisabled={isLoadingHardCancel}
            onOkClick={handleHardCancel}
      >
            <h5 className="text-center"><Translation ns="common" label="modals.hard-cancel.content"/></h5>
      </Modal>
      </>
    );
  }


  return (
    <CardItem onClick={handleClickCard} key="default-card">
      <div className="row align-items-center">
        <div className="col-12">
          <div className="row">
            <div className="d-flex col-10 text-truncate">
              <div className="me-2">
                <BountyStatusInfo
                  issueState={issueState}
                  fundedAmount={fundedAmount}
                  fundingAmount={fundingAmount}
                />
              </div>
              <span className="span text-truncate mb-3">
                {(issue?.title !== null && issue?.title) || (
                  <Translation ns="bounty" label={"errors.fetching"} />
                )}
              </span>
            </div>
            <div className="d-flex d-none d-lg-block justify-content-end col-md-2">
              <div className="d-flex justify-content-end">
                <If condition={variant === "multi-network"}>
                  <ResponsiveWrapper xs={false} xl={true}>
                    <div
                      className={`d-flex py-1 pe-2 justify-content-center text-truncate border border-gray-800
                        border-radius-4 text-white-40 bg-gray-850 text-uppercase`}
                    >
                      <div className="d-flex flex-column justify-content-center">
                        <div
                          className="d-flex ball mx-2"
                          style={{
                            backgroundColor: issue?.network?.chain?.color,
                          }}
                        />
                      </div>
                      {issue?.network?.chain?.chainShortName}
                    </div>
                  </ResponsiveWrapper>
                </If>
              </div>
            </div>
          </div>
          
          <ResponsiveWrapper xs={false} xl={true}>
            <div className="d-flex justify-content-md-start mb-3">
              <BountyTagsView tags={issue?.tags} />

              <If condition={issue?.isKyc}>
                <Badge
                  className={`d-flex status caption-medium py-1 px-3 
                  ms-2 bg-transparent border border-gray-700 text-gray-300`}
                  label={t("bounty:kyc.label")}
                />
              </If>
            </div>
          </ResponsiveWrapper>

          <div className="row align-items-center border-xl-top border-gray-850 pt-3">
            <ResponsiveWrapper xs={false} xl={true}>
              <div className="row w-100 align-items-center justify-content-md-start">
                <BountyItemLabel label="ID" className="col-auto">
                  <IssueTag />
                </BountyItemLabel>

                <BountyItemLabel label="Type" className="col-auto">
                  <span className="text-gray text-truncate text-capitalize">
                    {issue?.type}
                  </span>
                </BountyItemLabel>

                <ResponsiveWrapper xs={false} xxl={true} className="col-auto">
                  <RenderIssueData state={issueState} />
                </ResponsiveWrapper>

                <BountyItemLabel
                  label={t("info.opened-on")}
                  className="col-auto"
                >
                  <span className="text-gray text-truncate">
                    {issue?.createdAt?.toLocaleDateString("PT")}
                  </span>
                </BountyItemLabel>

                <div className="col d-flex justify-content-end">
                  <BountyAmount bounty={issue} size={size} />
                </div>
              </div>
            </ResponsiveWrapper>
            <ResponsiveWrapper
              xs={true}
              xl={false}
              className="row align-items-center justify-content-between"
            >
              <div className="col mw-50-auto network-name">
                <BountyTagsView tags={[issue?.network?.name]} />
              </div>

              <div className="col-auto px-0">
                <BountyAmount bounty={issue} size={size} />
              </div>
            </ResponsiveWrapper>
          </div>
        </div>
      </div>
    </CardItem>
  );
}