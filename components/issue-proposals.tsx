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


export default function IssueProposals({ metaProposals, metaRequests, numberProposals, issueId, amount, dbId }) {
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
        const isDisputed = await BeproService.network.isMergeDisputed({issueId: scIssueId, mergeId: scMergeId});
        const pr = metaRequests.find(({id}) => meta.pullRequestId === id);

        pool.push({...merge, scMergeId, isDisputed, pullRequestId, pullRequestGithubId: pr?.githubId } as Proposal)
      }
    }

    setProposals(pool);
  }

  async function loadProposalData(error?: boolean) {

    console.log(metaProposals);

    if (error)
      return;

    const pool = [];
    if (issueId)
      for (let i = 0; i < numberProposals; i++) {

        const issue_id = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);

        const merge = await BeproService.network.getMergeById({issue_id, merge_id: i,});

        await BeproService.network.isMergeDisputed({issueId: issue_id, mergeId: i,})
                          .then((isMergeDisputed) => (merge.isDisputed = isMergeDisputed))
                          .catch((err) => {
                            console.error("Error getting mergeDisputed state", err)
                          });

        await GithubMicroService.getMergeProposalIssue(dbId, (i + 1).toString())
                                .then((mergeProposal: ProposalData) => {
                                  merge.pullRequestId = mergeProposal?.pullRequestId;
                                  merge.pullRequestGithubId = mergeProposal?.pullRequest.githubId;
                                  merge.scMergeId = mergeProposal?.scMergeId;
                                })
                                .catch((err) => console.error(`Error getting proposal from microservice`, err));

        pool.push(merge);
      }

    setProposals(pool);
  }

  useEffect(() => { loadProposalsMeta() }, [issueId, numberProposals, currentAddress]);

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="content-wrapper mb-4 pb-0">
            <h3 className="smallCaption pb-3">{numberProposals} Proposals</h3>
            {proposals.map(proposal => <ProposalItem key={proposal._id} proposal={proposal} issueId={issueId} dbId={dbId} amount={amount} beproStaked={beproStaked} onDispute={loadProposalsMeta} />)}
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
