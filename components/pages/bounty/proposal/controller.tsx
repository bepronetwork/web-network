import {useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import { addSeconds, formatDistance } from "date-fns";
import {useTranslation} from "next-i18next";
import { useRouter } from "next/router";

import ProposalPageView from "components/pages/bounty/proposal/view";

import {useAppState} from "contexts/app-state";

import calculateDistributedAmounts from "helpers/calculateDistributedAmounts";
import { commentsParser, issueParser, mergeProposalParser } from "helpers/issue";
import { isProposalDisputable } from "helpers/proposal";
import { lowerCaseCompare } from "helpers/string";

import { IssueData } from "interfaces/issue-data";
import { DistributedAmounts } from "interfaces/proposal";

import { getCommentsData } from "x-hooks/api/comments";
import { getProposalData } from "x-hooks/api/proposal";
import useReactQuery from "x-hooks/use-react-query";

const defaultAmount = {
  value: "0",
  percentage: "0",
};

export default function ProposalPage() {
  const { query } = useRouter();
  const { t } = useTranslation("common");

  const [chaintime, setChainTime] = useState<number>();
  const [isUserAbleToDispute, setIsUserAbleToDispute] = useState(false);
  const [isDisputableOnChain, setIsDisputableOnChain] = useState<boolean>(false);
  const [missingDisputableTime, setMissingDisputableTime] = useState<string>("");
  const [distributedAmounts, setDistributedAmounts] =
    useState<DistributedAmounts>({
      treasuryAmount: defaultAmount,
      mergerAmount: defaultAmount,
      proposerAmount: defaultAmount,
      proposals: [],
    });

  const { state } = useAppState();

  const proposalId = query?.id?.toString();
  const proposalQueryKey = ["proposal", proposalId];
  const commentsQueryKey = ["proposal", "comments", proposalId];

  const { data: proposalData } = useReactQuery(proposalQueryKey, () => getProposalData(query));
  const { data: comments, invalidate: invalidateComments } = 
    useReactQuery(commentsQueryKey, () => getCommentsData({ proposalId }));

  const parsedProposal = mergeProposalParser(proposalData, proposalData?.issue?.merged);
  const parsedComments = commentsParser(comments);

  const issue = issueParser(parsedProposal?.issue as IssueData);
  const pullRequest = parsedProposal?.pullRequest;
  const networkTokenSymbol = state.Service?.network?.active?.networkToken?.symbol || t("misc.token");

  const isWalletConnected = !!state.currentUser?.walletAddress;

  const isDisputable = [
    isWalletConnected,
    isProposalDisputable( parsedProposal?.contractCreationDate,
                          BigNumber(state.Service?.network?.times?.disputableTime).toNumber(),
                          chaintime),
    !parsedProposal?.isDisputed,
    !parsedProposal?.refusedByBountyOwner,
    !issue?.isClosed,
    !parsedProposal?.isMerged,
  ].every((c) => c);

  const isRefusable = [
    isWalletConnected,
    !issue?.isClosed,
    !issue?.isCanceled,
    !parsedProposal?.isDisputed,
    !parsedProposal?.refusedByBountyOwner,
    lowerCaseCompare(issue?.user?.address, state.currentUser?.walletAddress),
  ].every((v) => v);

  const isMergeable = [
    isWalletConnected,
    !issue?.isClosed,
    !parsedProposal?.isMerged,
    !parsedProposal?.isDisputed,
    !parsedProposal?.refusedByBountyOwner,
    !isDisputable,
  ].every((v) => v);

  async function getDistributedAmounts() {
    if (!parsedProposal?.distributions || !state?.Service?.network?.amounts) return;

    const amountTotal = BigNumber.maximum(issue?.amount || 0, issue?.fundingAmount || 0);
    const { treasury, mergeCreatorFeeShare, proposerFeeShare } = state.Service.network.amounts;

    const distributions = calculateDistributedAmounts(treasury,
                                                      mergeCreatorFeeShare,
                                                      proposerFeeShare,
                                                      amountTotal,
                                                      parsedProposal.distributions);

    const proposals = distributions.proposals.map(({ recipient, ...rest }) => ({
      ...rest,
      recipient,
      githubLogin: parsedProposal?.distributions?.find(p => p.recipient === recipient)?.user?.githubLogin
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
      !parsedProposal?.contractCreationDate
    )
      return;

    const target = addSeconds(new Date(parsedProposal?.contractCreationDate), 
                              +state.Service?.network.times.disputableTime);
    const missingTime = formatDistance(new Date(chaintime), target, {
      includeSeconds: true,
    });

    setMissingDisputableTime(missingTime);
    setIsDisputableOnChain(+target - +new Date(chaintime) > 0);
  }

  useEffect(changeMissingDisputableTime, [
    parsedProposal?.contractCreationDate,
    chaintime,
    state.Service?.network?.times?.disputableTime,
  ]);

  useEffect(() => {
    if (state.Service?.active)
      state.Service?.active.getTimeChain().then(setChainTime);
  }, [state.Service?.active]);

  useEffect(() => {
    if (!parsedProposal || !state.currentUser?.walletAddress)
      setIsUserAbleToDispute(false);
    else
      setIsUserAbleToDispute(!parsedProposal.disputes?.some(({ address, weight }) => 
        address === state.currentUser.walletAddress && weight.gt(0)));
  }, [parsedProposal, state.currentUser?.walletAddress]);

  useEffect(() => {
    getDistributedAmounts();
  }, [state?.Service?.network?.amounts]);

  return (
    <ProposalPageView
      proposal={parsedProposal}
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
      comments={parsedComments}
      updateComments={invalidateComments}
      userData={state.currentUser}
    />
  );
}