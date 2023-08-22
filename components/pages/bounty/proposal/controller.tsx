import {useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import { addSeconds, formatDistance } from "date-fns";
import { toLower } from "lodash";
import {useTranslation} from "next-i18next";

import ProposalPageView from "components/pages/bounty/proposal/view";

import {useAppState} from "contexts/app-state";

import calculateDistributedAmounts from "helpers/calculateDistributedAmounts";
import { commentsParser, issueParser, mergeProposalParser, pullRequestParser } from "helpers/issue";
import { isProposalDisputable } from "helpers/proposal";

import { IssueData, IssueDataComment } from "interfaces/issue-data";
import { DistributedAmounts } from "interfaces/proposal";

import { ProposalPageProps } from "types/pages";

import getCommentsData from "x-hooks/api/comments/get-comments-data";

const defaultAmount = {
  value: "0",
  percentage: "0",
};

export default function ProposalPage(props: ProposalPageProps) {
  const { t } = useTranslation("common");

  const [chaintime, setChainTime] = useState<number>();
  const [isUserAbleToDispute, setIsUserAbleToDispute] = useState(false);
  const [isDisputableOnChain, setIsDisputableOnChain] = useState<boolean>(false);
  const [missingDisputableTime, setMissingDisputableTime] = useState<string>("");
  const [proposalComments, setProposalComments] = 
      useState<IssueDataComment[]>(commentsParser(props?.proposal?.comments));
  const [distributedAmounts, setDistributedAmounts] =
    useState<DistributedAmounts>({
      treasuryAmount: defaultAmount,
      mergerAmount: defaultAmount,
      proposerAmount: defaultAmount,
      proposals: [],
    });

  const { state } = useAppState();

  const proposal = mergeProposalParser(props?.proposal, props?.proposal?.issue?.merged);
  const issue = issueParser(proposal?.issue as IssueData);
  const pullRequest = pullRequestParser(proposal?.pullRequest);
  const networkTokenSymbol = state.Service?.network?.active?.networkToken?.symbol || t("misc.token");

  const allowMergeCommit = issue?.repository?.mergeCommitAllowed;
  const branchProtectionRules = state.Service?.network?.repos?.active?.branchProtectionRules;
  const approvalsRequired = branchProtectionRules
    ? branchProtectionRules[issue?.branch]?.requiredApprovingReviewCount || 0
    : 0;
  const approvalsCurrentPr = pullRequest?.approvals?.total || 0;
  const prsNeedsApproval = approvalsCurrentPr < approvalsRequired;
  const isWalletConnected = !!state.currentUser?.walletAddress;
  const isPrOwner = toLower(pullRequest?.userAddress) === toLower(state.currentUser?.walletAddress);
  const isProposalOwner = toLower(proposal?.creator) === toLower(state.currentUser?.walletAddress);

  const isDisputable = [
    isWalletConnected,
    isProposalDisputable( proposal?.contractCreationDate,
                          BigNumber(state.Service?.network?.times?.disputableTime).toNumber(),
                          chaintime),
    !proposal?.isDisputed,
    !proposal?.refusedByBountyOwner,
    !issue?.isClosed,
    !proposal?.isMerged,
  ].every((c) => c);

  const isRefusable = [
    isWalletConnected,
    !issue?.isClosed,
    !issue?.isCanceled,
    !proposal?.isDisputed,
    !proposal?.refusedByBountyOwner,
    issue?.creatorAddress?.toLowerCase() ===
    state.currentUser?.walletAddress?.toLowerCase(),
  ].every((v) => v);

  const isMergeable = [
    isWalletConnected,
    pullRequest?.isMergeable,
    !issue?.isClosed,
    !proposal?.isMerged,
    !proposal?.isDisputed,
    !proposal?.refusedByBountyOwner,
    !isDisputable,
    allowMergeCommit === true,
    !prsNeedsApproval,
    !isPrOwner,
    !isProposalOwner,
  ].every((v) => v);

  function updateProposalComments() {
    getCommentsData({ proposalId: proposal?.id?.toString() })
      .then((comments) => setProposalComments(commentsParser(comments)))
  }

  async function getDistributedAmounts() {
    if (!proposal?.distributions || !state?.Service?.network?.amounts) return;

    const amountTotal = BigNumber.maximum(issue?.amount || 0, issue?.fundingAmount || 0);
    const { treasury, mergeCreatorFeeShare, proposerFeeShare } = state.Service.network.amounts;

    const distributions = calculateDistributedAmounts(treasury,
                                                      mergeCreatorFeeShare,
                                                      proposerFeeShare,
                                                      amountTotal,
                                                      proposal.distributions);

    const proposals = distributions.proposals.map(({ recipient, ...rest }) => ({
      ...rest,
      recipient,
      githubLogin: proposal?.distributions?.find(p => p.recipient === recipient)?.user?.githubLogin
    }));

    setDistributedAmounts({
      ...distributions,
      proposals 
    });
  }

  function changeMissingDisputableTime() {
    if (
      !chaintime ||
      !state.Service?.network?.times?.disputableTime ||
      !proposal?.contractCreationDate
    )
      return;

    const target = addSeconds(new Date(proposal?.contractCreationDate), +state.Service?.network.times.disputableTime);
    const missingTime = formatDistance(new Date(chaintime), target, {
      includeSeconds: true,
    });

    setMissingDisputableTime(missingTime);
    setIsDisputableOnChain(+target - +new Date(chaintime) > 0);
  }

  useEffect(changeMissingDisputableTime, [
    proposal?.contractCreationDate,
    chaintime,
    state.Service?.network?.times?.disputableTime,
  ]);

  useEffect(() => {
    if (state.Service?.active)
      state.Service?.active.getTimeChain().then(setChainTime);
  }, [state.Service?.active]);

  useEffect(() => {
    if (!proposal || !state.currentUser?.walletAddress)
      setIsUserAbleToDispute(false);
    else
      setIsUserAbleToDispute(!proposal.disputes?.some(({ address, weight }) => 
        address === state.currentUser.walletAddress && weight.gt(0)));
  }, [proposal, state.currentUser?.walletAddress]);

  useEffect(() => {
    getDistributedAmounts();
  }, [state?.Service?.network?.amounts]);

  return (
    <ProposalPageView
      proposal={proposal}
      pullRequest={pullRequest}
      issue={issue}
      distributedAmounts={distributedAmounts}
      networkTokenSymbol={networkTokenSymbol}
      isUserAbleToDispute={isUserAbleToDispute && isDisputable}
      isDisputableOnChain={isDisputableOnChain}
      missingDisputableTime={missingDisputableTime}
      isDisputable={isDisputable}
      isRefusable={isRefusable}
      isMergeable={isMergeable}
      allowMergeCommit={allowMergeCommit}
      isPrOwner={isPrOwner}
      isProposalOwner={isProposalOwner}
      prsNeedsApproval={prsNeedsApproval}
      comments={proposalComments}
      updateComments={updateProposalComments}
      userData={state.currentUser}
    />
  );
}