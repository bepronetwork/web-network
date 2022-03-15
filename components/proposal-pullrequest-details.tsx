import { pullRequest } from "@interfaces/issue-data";
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
  currentPullRequest: pullRequest
}
export default function ProposalPullRequestDetail({proposal, networkProposal, currentPullRequest}:IProposalPRDetailsProps) {
  const { t } = useTranslation('pull-request');
  const { activeIssue } = useIssue();

  return (
    <CustomContainer>
      <div className="bg-shadow rounded-5 row gap-2 p-3">
        <div className="pt-1 d-inline-flex align-items-center justify-content-md-start gap-2">
          <span className="caption-large text-uppercase text-white">
            {t("pull-request:label")}
          </span>
          <span className="caption-large text-uppercase text-white-40">
            #{currentPullRequest?.githubId}
          </span>
          <PullRequestLabels merged={currentPullRequest?.merged} isMergeable={currentPullRequest?.isMergeable}/>
        </div>
        <div className="pt-1 d-inline-flex align-items-center justify-content-md-start gap-3">
          <div className="d-flex align-items-center">
            <Avatar className="me-2" userLogin={currentPullRequest?.githubLogin} />{" "}
            <GithubInfo
              parent="hero"
              variant="user"
              label={[`@`, currentPullRequest?.githubLogin].join(``)}
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
            <span className="text-primary">:{currentPullRequest?.branch}</span>
          </span>

          {proposal?.createdAt && <DateLabel
            date={currentPullRequest?.createdAt}
            className="text-white"
          />}
        </div>
        <ProposalProgress proposalAddress={networkProposal.prAddresses} proposalAmount={networkProposal.prAmounts} totalAmounts={activeIssue?.amount}/>
      </div>
    </CustomContainer>
  );
}
