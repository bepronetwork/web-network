import React, { useEffect, useState } from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import ArrowUpRightGray from "assets/icons/arrow-up-right-gray";
import EyeIcon from "assets/icons/eye-icon";
import EyeSlashIcon from "assets/icons/eye-slash-icon";
import TrashIcon from "assets/icons/trash-icon";

import Badge from "components/badge";
import BountyItemLabel from "components/bounty-item-label";
import BountyStatusInfo from "components/bounty-status-info";
import BountyTags from "components/bounty/bounty-tags";
import CardItem from "components/card-item";
import ChainBadge from "components/chain-badge";
import If from "components/If";
import IssueAmountInfo from "components/issue-amount-info";
import Modal from "components/modal";
import { FlexColumn } from "components/profile/wallet-balance";
import ResponsiveWrapper from "components/responsive-wrapper";
import Translation from "components/translation";

import {useAppState} from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";

import { IM_AM_CREATOR_NETWORK } from "helpers/constants";
import {getIssueState} from "helpers/handleTypeIssue";

import {IssueBigNumberData, IssueState} from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import { useAuthentication } from "x-hooks/use-authentication";
import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";

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
  
  const { updateVisibleBounty } = useApi();
  const { getURLWithNetwork } = useNetwork();
  const { signMessage } = useAuthentication();
  const { handleHardCancelBounty } = useBepro();

  const isVisible = visible !== undefined ? visible : issue?.visible;

  const issueState = getIssueState({
    state: issue?.state,
    amount: issue?.amount,
    fundingAmount: issue?.fundingAmount,
  })
  const fundedAmount = issue?.fundedAmount.isNaN() ? BigNumber(0) : issue?.fundedAmount
  const percentage =
  BigNumber(fundedAmount.multipliedBy(100).toFixed(2, 1))
    .dividedBy(issue?.fundingAmount)
    .toFixed(0, 1) || 0;

  function handleClickCard() {
    if (xClick) return xClick();
    router.push(getURLWithNetwork("/bounty", {
      id: issue?.githubId,
      repoId: issue?.repository_id,
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
    await signMessage(IM_AM_CREATOR_NETWORK).then(async () => {
      updateVisibleBounty({
      issueId: issue?.issueId,
      creator: state?.currentUser?.walletAddress,
      networkAddress: issue?.network?.networkAddress,
      visible: !isVisible,
      accessToken: state.currentUser?.accessToken,
      override: true,
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
    })
  }

  function handleHardCancel() {
    setIsLoadingHardCancel(true)
    handleHardCancelBounty(issue?.contractId, issue?.issueId)
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

  function IssueTag({uppercase = true}) {
    const tag = issue?.network?.name;
    const id = issue?.githubId;

    return (
      <span className={`${(tag && uppercase) && 'text-uppercase' || ""} text-gray me-2`}>
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
        <BountyItemLabel label={translation} key={issue.githubId} className="col-auto">
          <span className={`${ isFunding ? 'text-light-warning': "text-gray"}`}>
            {value || 0}{isFunding && '%'}
          </span>
        </BountyItemLabel>
      );
    } else return <></>;
  }

  if (size === "sm") {
    return (
      <CardItem onClick={handleClickCard} key="sm-card">
        <>
          <div className="d-flex flex-row align-items-center justify-content-between">
            <div className="d-flex flex-row align-items-center gap-3">
              <div className="network-name bg-dark-gray p-1 border-radius-8">
                {issue?.network?.logoIcon && (
                  <img
                    src={`${state.Settings?.urls?.ipfs}/${issue?.network?.logoIcon}`}
                    width={14}
                    height={14}
                    className="ms-1 me-2"
                  />
                )}
                <span className="caption-small me-1 text-uppercase">
                  {issue?.network?.name}
                </span>
              </div>

              <ChainBadge chain={issue?.network?.chain} />
            </div>

            <BountyStatusInfo issueState={issueState} />
          </div>
          <div className="text-truncate mb-2 mt-4">{issue?.title}</div>
          <div className="issue-body text-white-40 text-break text-truncate mb-3" >
            {issue?.body}
          </div>
          <div className={!issue?.isFundingRequest && 'mt-4' || ""}>
            <IssueAmountInfo issue={issue} size={size} />
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
        <div className="row align-center">
          <div className="col-md-6">
            <span className={`text-truncate ${!isVisible && 'text-decoration-line' || ""}`}>
              {(issue?.title !== null && issue?.title) || (
                <Translation ns="bounty" label={"errors.fetching"} />
              )}
            </span>
            <div className={!isVisible && 'text-decoration-line' || ""}>
              <IssueTag uppercase={false} />
            </div>
          </div>
          <div className="col-md-2 d-flex justify-content-center">
            <FlexColumn className="justify-content-center">
              <div
                className="cursor-pointer"
                onClick={handleClickCard}
              >
                <ArrowUpRightGray />
              </div>
            </FlexColumn>
          </div>
          <div className="col-md-2 d-flex justify-content-center">
          <FlexColumn className="justify-content-center">
              <div className="cursor-pointer" onClick={handleHideBounty}>
                {isVisible ? <EyeIcon /> : <EyeSlashIcon />}
              </div>
          </FlexColumn>
          </div>
          <div className="col-md-2 d-flex justify-content-center">
          <FlexColumn className="justify-content-center">
            {!hideTrashIcon && isCancelable && !['canceled', 'closed', 'proposal'].includes(issue?.state) ? (
            <div className="cursor-pointer m-0 p-0" onClick={() => setShowHardCancelModal(true)}>
              <TrashIcon />
            </div>
            ): '-'}

          </FlexColumn>
          </div>
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
        <div className="col-md-12 mb-3">
          <div className="d-flex">
            <div className="d-flex col-md-10 text-truncate">
              <div className="me-2">
                <BountyStatusInfo
                  issueState={issueState}
                  fundedAmount={fundedAmount}
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
              <BountyTags tags={issue?.tags} />

              <If condition={issue?.isKyc}>
                <Badge
                  className={`d-flex status caption-medium py-1 px-3 
                  ms-2 bg-transparent border border-gray-700 text-gray-300`}
                  label={t("bounty:kyc.label")}
                />
              </If>
            </div>
          </ResponsiveWrapper>

          <ResponsiveWrapper xs={false} xl={true}>
            <div className="w-100 border-top border-gray-850"></div>
          </ResponsiveWrapper>

          <div className="row mt-3 align-items-center">
            <ResponsiveWrapper xs={false} xl={true}>
              <div className="row w-100 align-items-center justify-content-md-start">
                <BountyItemLabel label="ID" className="col-auto">
                  <IssueTag />
                </BountyItemLabel>

                <BountyItemLabel label="Repository" className="col-auto">
                  <OverlayTrigger
                    key="bottom-githubPath"
                    placement="bottom"
                    overlay={
                      <Tooltip id={"tooltip-bottom"}>
                        {issue?.repository?.githubPath}
                      </Tooltip>
                    }
                  >
                    <span className={`text-gray me-2 text-truncate`}>
                      {issue?.repository?.githubPath.split("/")?.[1]}
                    </span>
                  </OverlayTrigger>
                </BountyItemLabel>

                <ResponsiveWrapper xs={false} xxl={true} className="col-auto">
                  <RenderIssueData state={issueState} />
                </ResponsiveWrapper>

                <BountyItemLabel
                  label="Opened on"
                  className="col-auto"
                >
                  <span className="text-gray text-truncate">
                    {issue?.createdAt?.toLocaleDateString("PT")}
                  </span>
                </BountyItemLabel>

                <div className="col d-flex justify-content-end px-0">
                  <IssueAmountInfo issue={issue} size={size} />
                </div>
              </div>
            </ResponsiveWrapper>

            <ResponsiveWrapper xs={true} xl={false}>
              <div className="row w-100 justify-content-between">
                <div className="col">
                  <BountyTags tags={[issue?.network?.name]} />
                </div>
                
                <div className="col-auto px-0">
                  <IssueAmountInfo issue={issue} size={size} />
                </div>
              </div>
            </ResponsiveWrapper>
          </div>
        </div>
      </div>
    </CardItem>
  );
}