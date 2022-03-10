import { useContext } from "react";
import { useEffect, useState } from "react";
import { ProposalData } from "@interfaces/api-response";
import { BeproService } from "@services/bepro-service";
import { ApplicationContext } from "@contexts/application";
import ProposalItem from "@components/proposal-item";
import { INetworkProposal, Proposal } from "@interfaces/proposal";
import NothingFound from "./nothing-found";
import { useTranslation } from "next-i18next";
import { isProposalDisputable } from "@helpers/proposal";
import useApi from "@x-hooks/use-api";
import { IssueData } from "@interfaces/issue-data";
import React from "react";

interface IProposalList {
  networkProposal: INetworkProposal;
  proposal: Proposal;
}
interface IIssueProposalProps {
  issue: IssueData;
  networkIssueId: number;
  isFinalized: boolean;
  className: string;
}
export default function IssueProposals({
  issue,
  networkIssueId,
  className = "",
  isFinalized = false,
}: IIssueProposalProps) {
  const {
    state: { currentAddress },
  } = useContext(ApplicationContext);
  const [proposals, setProposals] = useState<IProposalList[]>([]);
  const [disputableTime, setDisputableTime] = useState(0);
  const { getProposal } = useApi();
  const { t } = useTranslation("proposal");

  async function loadProposalsMeta() {
    if (!issue.issueId) return;

    const pool: IProposalList[] = [];

    for (const meta of issue.mergeProposals as ProposalData[]) {
      const { id: proposalId, scMergeId } = meta;

      if (scMergeId) {
        const merge = await BeproService.network.getMergeById(
          +networkIssueId,
          +scMergeId
        );

        const isDisputed = issue.merged
          ? issue.merged !== scMergeId
          : await BeproService.network.isMergeDisputed(
              +networkIssueId,
              +scMergeId
            );

        const proposal = await getProposal(proposalId);

        pool.push({
          networkProposal: {
            ...merge,
            isDisputed,
          },
          proposal,
        });
      }
    }

    setProposals(pool);
    BeproService.getDisputableTime().then(setDisputableTime);
  }

  useEffect(() => {
    loadProposalsMeta();
  }, [issue, currentAddress]);

  return (
    <div className={`content-wrapper ${className || ""} pt-0 pb-0`}>
      {React.Children.toArray(
        proposals?.map(({ proposal, networkProposal }) => (
          <ProposalItem
            key={proposal.id}
            proposal={proposal}
            networkProposal={networkProposal}
            issue={issue}
            networkIssueId={networkIssueId}
            onDispute={loadProposalsMeta}
            isFinalized={isFinalized}
            isDisputable={
              isProposalDisputable(proposal.createdAt, disputableTime) &&
              !proposal.isDisputed
            }
          />
        ))
      ) || <NothingFound description={t("errors.not-found")} />}
      {proposals?.length === 0 && (
        <div className="content-list-item proposal caption-small text-center text-uppercase p-4 text-ligth-gray">
          {t("messages.no-proposals-created")}
        </div>
      )}
    </div>
  );
}
