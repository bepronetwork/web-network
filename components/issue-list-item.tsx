import React from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {isMobile} from "react-device-detect";

import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import BountyStatusInfo from "components/bounty-status-info";
import BountyTags from "components/bounty/bounty-tags";
import CardItem from "components/card-item";
import ChainBadge from "components/chain-badge";
import DateLabel from "components/date-label";
import IssueAmountInfo from "components/issue-amount-info";
import Translation from "components/translation";

import {useAppState} from "contexts/app-state";

import {getIssueState} from "helpers/handleTypeIssue";

import {IssueBigNumberData, IssueState} from "interfaces/issue-data";

import { useNetwork } from "x-hooks/use-network";
interface IssueListItemProps {
  issue?: IssueBigNumberData;
  xClick?: () => void;
  size?: "sm" | "lg"
}

export default function IssueListItem({
  size = "lg",
  issue = null,
  xClick,
}: IssueListItemProps) {
  const router = useRouter();
  const { t } = useTranslation(["bounty", "common"]);
  
  const {state} = useAppState();
  const { getURLWithNetwork } = useNetwork();

  const issueState = getIssueState({
    state: issue?.state,
    amount: issue?.amount,
    fundingAmount: issue?.fundingAmount,
  })

  function handleClickCard() {
    if (xClick) return xClick();
    router.push(getURLWithNetwork("/bounty", {
      id: issue?.githubId,
      repoId: issue?.repository_id,
      network: issue?.network?.name,
      chain: issue?.network?.chain?.chainShortName
    }));
  }

  function IssueTag() {
    const tag = issue?.network?.name;
    const id = issue?.githubId;

    return (
      <span className={`${tag && 'text-uppercase'} h6 text-white-40 me-2`}>
        {tag ? `${tag}-${id}` : `#${id}`}
      </span>
    );
  }

  function RenderIssueData({ state }: {state: IssueState}) {
    const types = {
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

    if (["open", "ready", "proposal"].includes(state?.toLowerCase())) {
      const { value, translation } = types[state?.toLowerCase()];
      return (
        <div className="d-flex align-items-center" key={issue.githubId}>
          <span className="caption-medium mr-1 text-white">
            {value || 0}
          </span>
          <span className="caption-medium text-white-40 text-uppercase">
            {translation}
          </span>
        </div>
      );
    } else return <></>;
  }

  if (size === "sm") {
    return (
      <CardItem onClick={handleClickCard}>
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

            <BountyStatusInfo issueState={issueState} className="mt-1 px-2 " />
          </div>
          <div className="text-truncate mb-2 mt-4">{issue?.title}</div>
          <div className="issue-body text-white-40 text-break text-truncate mb-3" >
            {issue?.body}
          </div>
          <IssueAmountInfo issue={issue} size={size} />
        </>
      </CardItem>
    );
  }


  return (
    <CardItem onClick={handleClickCard}>
      <div className="row align-center">
        <div className="col-md-10 mb-3 mb-md-0">
          <h4 className="h4 text-truncate mb-3">
            <IssueTag/>
            {(issue?.title !== null && issue?.title) || (
              <Translation ns="bounty" label={"errors.fetching"} />
            )}
          </h4>
          <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start mt-2 gap-20">
            {!isMobile && (
              <>
                <BountyStatusInfo issueState={issueState} />
                {issue?.isKyc ? <Badge
                  className={`d-flex status caption-medium py-1 px-3 bg-transparent border border-gray-700 text-gray-300`}
                  label={t("bounty:kyc.label")}
                /> : null}
                <div className="d-flex align-items-center">
                  <AvatarOrIdenticon
                    address={issue?.creatorAddress}
                    user={issue?.creatorGithub}
                    size="sm"
                  />
                  {issue?.repository && (
                    <OverlayTrigger
                      key="bottom-githubPath"
                      placement="bottom"
                      overlay={
                        <Tooltip id={"tooltip-bottom"}>
                          {issue?.repository?.githubPath}
                        </Tooltip>
                      }
                    >
                      <div className={`${!issue?.network?.colors?.primary && "bg-primary"} rounded-4 px-2 py-1 ml-2`}
                        style={{backgroundColor: issue?.network?.colors?.primary}}>
                        <span className="caption-medium text-uppercase mw-github-info">
                          {issue?.repository?.githubPath.split("/")?.[1]}
                        </span>
                      </div>
                    </OverlayTrigger>
                  )}
                </div>
              </>
            )}

            <RenderIssueData state={issueState} />

            <DateLabel date={issue?.createdAt} className="text-white-40" />
            
            <DateLabel date={issue?.createdAt} className="text-white-40" />
            
            <BountyTags tags={issue?.tags} color={issue?.network?.colors?.primary}/>
          </div>
        </div>

        <div className="col-md-2 my-auto text-center">
          <IssueAmountInfo issue={issue} size={size} />
        </div>
      </div>
    </CardItem>
  )
}
