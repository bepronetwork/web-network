import { useContext } from "react";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import {ProposalData,} from "@services/github-microservice";
import { BeproService } from "@services/bepro-service";
import { ApplicationContext } from "@contexts/application";
import ProposalItem from '@components/proposal-item';
import {Proposal} from '@interfaces/proposal';
import NothingFound from "./nothing-found";

export default function IssueProposals({ metaProposals, metaRequests, numberProposals, issueId, amount, dbId, isFinalized = false, mergedProposal }) {
  const { state: {beproStaked, currentAddress} } = useContext(ApplicationContext);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  async function loadProposalsMeta() {
    if (!issueId)
      return;

    const scIssueId = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);
    const pool = [];

    for (const meta of metaProposals as ProposalData[]) {
      const {scMergeId, pullRequestId} = meta;
      if (scMergeId) {
        // if we don't have a scMergeId then something broke on the BE side and we should have a log - but we lost its connection to a PR
        const merge = await BeproService.network.getMergeById({merge_id: scMergeId, issue_id: scIssueId});
        const isDisputed = mergedProposal ? mergedProposal !== scMergeId : await BeproService.network.isMergeDisputed({issueId: scIssueId, mergeId: scMergeId});
        const pr = metaRequests.find(({id}) => meta.pullRequestId === id);

        pool.push({...merge, scMergeId, isDisputed, pullRequestId, pullRequestGithubId: pr?.githubId, owner: pr?.githubLogin, isMerged: mergedProposal === scMergeId } as Proposal)
      }
    }

    setProposals(pool);
  }

  useEffect(() => { loadProposalsMeta() }, [issueId, numberProposals, currentAddress]);

  return (
    <div className={`content-wrapper mb-4 pt-0 ${proposals.length > 0 && 'pb-0' || 'pb-3'}`}>
      {metaProposals?.length > 0 && proposals.map(proposal =>
                        <ProposalItem key={proposal._id}
                                      proposal={proposal}
                                      issueId={issueId}
                                      dbId={dbId}
                                      amount={amount}
                                      beproStaked={beproStaked}
                                      onDispute={loadProposalsMeta}
                                      isFinalized={isFinalized}
                                      isMerged={proposal.isMerged}
                                      owner={proposal.owner}/>) || <NothingFound description={'No proposals found'} /> }
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
