import {GetStaticProps} from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import PageActions from '@components/page-actions';
import ProposalAddresses from '@components/proposal-addresses';
import ProposalHero from '@components/proposal-hero';
import ProposalProgress from '@components/proposal-progress';
import {useRouter} from 'next/router';
import {ApplicationContext} from '@contexts/application';
import {BeproService} from '@services/bepro-service';
import GithubMicroService, {ProposalData, User,} from '@services/github-microservice';
import {formatDate} from '@helpers/formatDate';
import {handlePercentage} from '@helpers/handlePercentage';
import {IssueData} from '@interfaces/issue-data';
import {addToast} from '@reducers/add-toast';

import ProposalProgressBar from '@components/proposal-progress-bar';
import {changeOraclesState} from '@reducers/change-oracles';
import CustomContainer from '@components/custom-container';

interface ProposalBepro {
  disputes: string;
  prAddresses: string[];
  prAmounts: number[];
  proposalAddress: string;
  votes: string;
  _id: string;
  isDisputed?: boolean;
  author?: string;
}

interface usersAddresses {
  address: string;
  githubLogin: string;
  oracles: string;
  percentage: number;
}

export default function PageProposal() {
  const router = useRouter();
  const {id, issueId} = router.query;
  const { dispatch, state: {currentAddress, beproStaked}, } = useContext(ApplicationContext);

  const [proposalBepro, setProposalBepro] = useState<ProposalBepro>();
  const [proposalMicroService, setProposalMicroService] = useState<ProposalData>();
  const [amountIssue, setAmountIssue] = useState<string>();
  const [networkCid, setNetworkCid] = useState<string>();
  const [isFinalized, setIsFinalized] = useState<boolean>();
  const [usersAddresses, setUsersAddresses] = useState<usersAddresses[]>();
  const [issueMicroService, setIssueMicroService] = useState<IssueData>();

  async function getProposalData() {
    const mergeProposal = await GithubMicroService.getMergeProposalIssue(issueId, id);
    const issueData = await GithubMicroService.getIssueId(issueId);
    setProposalMicroService(mergeProposal as ProposalData);
    setIssueMicroService(issueData);

    return Promise.resolve();
  }

  async function getProposal() {
    // todo: match the correct merge id on the database with the one on smart contract
    const mergeId = (+id - 1).toString();

    try {
      const merge = await BeproService.network.getMergeById({issue_id: issueId, merge_id: mergeId});
      const isDisputed = await BeproService.network.isMergeDisputed({issueId, mergeId});
      const author = await GithubMicroService.getHandleOf(merge.proposalAddress);

      setProposalBepro({...merge, isDisputed, author});
      return Promise.resolve();
    } catch (e) {
      console.error(`Error fetching Proposal for issue ${issueId} with merge ${mergeId}`, e);
    }
  }

  function getIssueAmount() {
    return BeproService.network.getIssueById({issueId: id})
                       .then(issue => {
                         setAmountIssue(issue.tokensStaked);
                         setNetworkCid(issue.cid);
                         setIsFinalized(issue.finalized);
                       })
  }

  function updateUsersAddresses(proposal: ProposalBepro) {
    if (!proposal)
      return;

    console.log(`mapping proposal`, JSON.parse(JSON.stringify(proposal)));

    async function mapUser(address: string, i: number) {

      console.log(`address`, address, `i`, i, `${amountIssue}`);

      const {githubLogin} = await GithubMicroService.getUserOf(address);
      const oracles = proposal.prAmounts[i].toString();
      const percentage = handlePercentage(+oracles, +amountIssue);

      return {githubLogin, percentage, address, oracles};
    }

    Promise.all(proposal.prAddresses.map(mapUser)).then(setUsersAddresses)
  }

  function loadProposalData() {
    if (issueId && id && currentAddress) {
      BeproService.network.getOraclesSummary({address: currentAddress})
                  .then(oracles => dispatch(changeOraclesState(oracles)))
                  .then(_ => getIssueAmount())
                  .then(_ => getProposalData())
                  .then(_ => getProposal());
    }
  }

  useEffect(() => { loadProposalData() }, [currentAddress, id, issueId]);
  useEffect(() => { updateUsersAddresses(proposalBepro) }, [proposalBepro, currentAddress]);

  return (
    <>
      <ProposalHero
        githubId={issueMicroService?.githubId}
        title={issueMicroService?.title}
        pullRequestId={proposalMicroService?.pullRequest.githubId}
        authorPullRequest={proposalBepro?.author}
        createdAt={
          proposalMicroService && formatDate(proposalMicroService.createdAt)
        }
        beproStaked={amountIssue}/>
      <ProposalProgress developers={usersAddresses}/>
      <CustomContainer>
        <div className="col-6">
          <ProposalProgressBar issueDisputeAmount={+proposalBepro?.disputes} isDisputed={proposalBepro?.isDisputed} stakedAmount={+beproStaked} />
        </div>
      </CustomContainer>
      <PageActions
        state={'pull request'}
        developers={[]}
        finalized={isFinalized}
        isIssueinDraft={issueMicroService.state === `draft`}
        addressNetwork={networkCid}
        issueId={issueId?.toString()}
        mergeId={(+id+1).toString()}
        handleBeproService={getProposal}
        isDisputed={proposalBepro?.isDisputed}
        UrlGithub={`https://github.com/bepronetwork/bepro-js-edge/pull/${proposalMicroService?.pullRequest.githubId}`}/>

      <ProposalAddresses addresses={usersAddresses} currency="$BEPRO" />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
