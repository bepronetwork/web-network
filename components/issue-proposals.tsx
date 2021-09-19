import { useContext } from "react";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import GithubMicroService, {
  ProposalData,
} from "@services/github-microservice";
import { BeproService } from "@services/bepro-service";
import { ApplicationContext } from "@contexts/application";
import ProposalItem from '@components/proposal-item';
import {Proposal} from '@interfaces/proposal';


export default function IssueProposals({ numberProposals, issueId, amount }) {
  const { state: {beproStaked} } = useContext(ApplicationContext);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const gets = async (error?: boolean) => {
    if (error)
      return;

    const pool = [];
    if (issueId)
      for (let i = 0; i < numberProposals; i++) {

        const merge = await BeproService.network.getMergeById({issue_id: issueId, merge_id: i,});

        await BeproService.network.isMergeDisputed({issueId: issueId, mergeId: i,})
          .then((isMergeDisputed) => (merge.isDisputed = isMergeDisputed))
          .catch((err) => console.log("Error getting mergeDisputed state", err));

        await GithubMicroService.getMergeProposalIssue(issueId, (i + 1).toString())
          .then((mergeProposal: ProposalData) => {
            merge.pullRequestId = mergeProposal?.pullRequestId;
            merge.pullRequestGithubId = mergeProposal?.pullRequest.githubId;
          })
          .catch((err) => console.log(`Error getting proposal from microservice`, err));

        pool.push(merge);
      }

    if (pool.length === numberProposals) setProposals(pool);
  };


  useEffect(() => {
    gets();
  }, [issueId, numberProposals]);

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="content-wrapper mb-4 pb-0">
            <h3 className="smallCaption pb-3">{numberProposals} Proposals</h3>
            {proposals.map(proposal => <ProposalItem proposal={proposal} issueId={issueId} amount={amount} beproStaked={beproStaked} onDispute={gets} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
