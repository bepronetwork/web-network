import { IssueData } from "@interfaces/issue-data";
import { useIssue } from "contexts/issue";
import { INetworkProposal, Proposal } from "interfaces/proposal";
import { useTranslation } from "next-i18next";
import Avatar from "./avatar";
import CustomContainer from "./custom-container";
import DateLabel from "./date-label";
import GithubInfo from "./github-info";
import ProposalProgress from "./proposal-progress";
import PullRequestLabels from "./pull-request-labels";
import Translation from "./translation";

interface IProposalPRDetailsProps{
  proposal: Proposal,
  networkProposal: INetworkProposal,
}
export default function ProposalPullRequestDetail({proposal, networkProposal}:IProposalPRDetailsProps) {
  const { t } = useTranslation('pull-request');
  const { activeIssue } = useIssue();

  return (
    <CustomContainer className="bg-shadow rounded-5">
      <div className="row">
        <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-2">
          <span className="caption-large text-uppercase text-white">
            {t("pull-request:label")}
          </span>
          <span className="caption-large text-uppercase text-white-40">
            #{proposal?.pullRequestId}
          </span>
          <PullRequestLabels merged={proposal.isMerged} isMergeable={true}/>
        </div>
        <div className="mt-3 pt-1 d-inline-flex align-items-center justify-content-md-start gap-4">
          <div className="d-flex align-items-center">
            <Avatar className="me-2" userLogin={proposal?.githubLogin} />{" "}
            <GithubInfo
              parent="hero"
              variant="user"
              label={[`@`, proposal?.githubLogin].join(``)}
            />
          </div>

          <span className="caption-small">
            {(activeIssue?.repository && (
              <GithubInfo
                parent="list"
                variant="repository"
                label={activeIssue?.repository?.githubPath}
              />
            )) ||
              ``}
          </span>

          <span className="caption-small text-ligth-gray text-uppercase">
            <Translation label={`branch`} />
            <span className="text-primary">:{activeIssue?.branch}</span>
          </span>

          {proposal?.createdAt && <DateLabel
            date={proposal?.createdAt}
            className="text-white"
          />}
        </div>
        <ProposalProgress proposalAddress={networkProposal.prAddresses} proposalAmount={networkProposal.prAmounts} totalAmounts={activeIssue?.amount}/>
      </div>
    </CustomContainer>
  );
}
