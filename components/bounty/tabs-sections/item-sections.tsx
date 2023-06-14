
import React from "react";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import {v4 as uuidv4} from "uuid";

import ItemRow from "components/bounty/tabs-sections/item-row";
import Button from "components/button";
import GithubLink from "components/github-link";
import NothingFound from "components/nothing-found";
import ProposalProgressSmall from "components/proposal-progress-small";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import Translation from "components/translation";

import { useAppState } from "contexts/app-state";

import { IssueBigNumberData, pullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import { useNetwork } from "x-hooks/use-network";

interface ItemProps {
  data: Proposal[] | pullRequest[],
  isProposal: boolean,
  currentBounty: IssueBigNumberData;
}

function ItemSections({ data, isProposal, currentBounty }: ItemProps) {
  const { t } = useTranslation(["proposal", "pullrequest", "common"]);
  const {state} = useAppState();
  const router = useRouter();
  const { getURLWithNetwork } = useNetwork();

  const branchProtectionRules = state.Service?.network?.repos?.active?.branchProtectionRules;
  const approvalsRequired =
    branchProtectionRules ?
      branchProtectionRules[currentBounty?.branch]?.requiredApprovingReviewCount || 0 : 0;
  const canUserApprove = state.Service?.network?.repos?.active?.viewerPermission !== "READ";

  return (
    <section className="content-wrapper border-top-0 p-20 d-flex flex-column gap-2 bg-gray-900">
      {
        data?.length ?
          React.Children.toArray(data?.map((item) => {
            const pathRedirect = isProposal ? '/proposal' : '/pull-request';
            const valueRedirect = {
              id: currentBounty?.githubId,
              repoId: currentBounty?.repository_id,
              prId: undefined,
              proposalId: undefined
            };
            const status = []

            const proposal =
              currentBounty?.mergeProposals?.find((proposal) => proposal.contractId === +item?.contractId);
            const isDisputed = !!proposal?.isDisputed
            const isMerged = item?.isMerged;

            if(!isProposal){
              status.push({
                merged: item?.merged,
                isMergeable: item?.isMergeable,
                isDraft: item?.status === "draft"
              })
              valueRedirect.prId = (item as pullRequest)?.githubId;
            } else if(proposal){
              if(isDisputed || isMerged){
                status.push({
                  label: isDisputed ? 'disputed' : 'accepted'
                })
              }
              if(proposal.refusedByBountyOwner) status.push({ label: 'failed' })

              valueRedirect.proposalId = item?.id
            }

            const btnLabel = isProposal ? "actions.view-proposal" : 
              item.status === "draft" ? "actions.view-pull-request" : "actions.review";
            const approvalsCurrentPr = item?.approvals?.total || 0;
            const shouldRenderApproveButton = approvalsCurrentPr < approvalsRequired && canUserApprove && !isProposal;
            const itemId = isProposal ? item?.contractId + 1 : item?.githubId;
            const totalToBeDisputed = BigNumber(state.Service?.network?.amounts?.percentageNeededForDispute)
              .multipliedBy(state.Service?.network?.amounts?.totalNetworkToken)
              .dividedBy(100);

            return (
              <ItemRow 
                key={`${uuidv4()} ${item?.id}`}
                id={itemId}
                href={getURLWithNetwork(pathRedirect, valueRedirect)} 
                githubLogin={item?.githubLogin}
                creator={item?.creator} 
                status={status}>
                {(isProposal && proposal) ? (
                  <>
                    <div className="d-flex align-items-center text-center col-4">
                      <ProposalProgressSmall
                        color={isDisputed ? 'danger' : isMerged ? 'success' : 'purple'}
                        value={proposal?.disputeWeight}
                        total={totalToBeDisputed}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="d-flex align-items-center text-center">
                      <span className="label-m text-white">{(item as pullRequest)?.reviewers?.length || 0}</span>

                      <span className="label-m text-uppercase text-gray-500 ml-1">
                        <Translation
                          ns="pull-request"
                          label="review"
                          params={{ count: (item as pullRequest)?.reviewers?.length || 0 }}
                        />
                      </span>
                    </div>
                  </>
                )}

                <ReadOnlyButtonWrapper>
                  <div className="row align-items-center">
                    <div className="col">
                      <Button
                        className="read-only-button text-truncate"
                        onClick={(ev) => {
                          ev.preventDefault();
                          router.push?.(getURLWithNetwork(pathRedirect, {
                            ...valueRedirect,
                            review: item?.status === "ready"
                          }))
                        }}
                      >
                        <span className="label-m text-white">
                          <Translation label={btnLabel} />
                        </span>
                      </Button>
                    </div>

                    { shouldRenderApproveButton &&
                      <div className="col">
                        <GithubLink
                          forcePath={state.Service?.network?.repos?.active?.githubPath}
                          hrefPath={`pull/${item?.githubId || ""}/files`}
                          color="primary"
                          onClick={e => e.stopPropagation()}
                        >
                          {t("common:actions.approve")}
                        </GithubLink>
                      </div>
                    }
                  </div>
                </ReadOnlyButtonWrapper>
              </ItemRow>
            )
          }))
          : <NothingFound description={t("errors.not-found")} />
      }
    </section>
  )
}
export default ItemSections;