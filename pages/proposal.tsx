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
import {changeOraclesParse, changeOraclesState} from '@reducers/change-oracles';
import CustomContainer from '@components/custom-container';
import {formatNumberToCurrency} from '@helpers/formatNumber';
import ConnectWalletButton from '@components/connect-wallet-button';

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
  const {prId, mergeId, dbId, issueId} = router.query;
  const { dispatch, state: {currentAddress, beproStaked}, } = useContext(ApplicationContext);

  const [proposalBepro, setProposalBepro] = useState<ProposalBepro>();
  const [proposalMicroService, setProposalMicroService] = useState<ProposalData>();
  const [amountIssue, setAmountIssue] = useState<string>();
  const [networkCid, setNetworkCid] = useState<string>();
  const [isFinalized, setIsFinalized] = useState<boolean>();
  const [isFinished, setIsFinished] = useState<boolean>();
  const [usersAddresses, setUsersAddresses] = useState<usersAddresses[]>();
  const [issueMicroService, setIssueMicroService] = useState<IssueData>(null);

  async function getProposalData() {
    const mergeProposal = await GithubMicroService.getMergeProposalIssue(dbId, mergeId);
    const issueData = await GithubMicroService.getIssueId(issueId);
    setProposalMicroService(mergeProposal as ProposalData);
    setIssueMicroService(issueData);
    setAmountIssue(issueData?.amount?.toString())
  }

  async function getProposal() {

    try {
      const issue_id = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);
      const merge = await BeproService.network.getMergeById({issue_id: issue_id, merge_id: mergeId});
      const isDisputed = await BeproService.network.isMergeDisputed({issueId: issue_id, mergeId});
      const author = await GithubMicroService.getHandleOf(merge.proposalAddress);

      setProposalBepro({...merge, isDisputed, author});
      return Promise.resolve();
    } catch (e) {
      console.error(`Error fetching Proposal for issue cid:${issueId} with merge:${mergeId}`, e);
    }
  }

  function getIssueAmount() {
    return BeproService.network.getIssueByCID({issueCID: issueMicroService?.issueId})
                       .then(({_id}) => BeproService.network.getIssueById({issueId: _id}))
                       .then(issue => {
                         setAmountIssue(issue.tokensStaked);
                         setNetworkCid(issue.cid);
                         setIsFinalized(issue.finalized);
                         setIsFinished(issue.recognizedAsFinished);
                       })
  }

  function updateUsersAddresses(proposal: ProposalBepro) {
    if (!proposal)
      return;

    async function mapUser(address: string, i: number) {

      const {githubLogin} = await GithubMicroService.getUserOf(address);
      const oracles = proposal.prAmounts[i].toString();
      const percentage = handlePercentage(+oracles, +amountIssue);
      return {githubLogin, percentage, address, oracles};
    }

    Promise.all(proposal.prAddresses.map(mapUser)).then(setUsersAddresses)
  }

  function loadProposalData() {
    if (issueId && currentAddress) {
      BeproService.network.getOraclesSummary({address: currentAddress})
                  .then(oracles => dispatch(changeOraclesState(changeOraclesParse(currentAddress, oracles))))
                  .then(async () => {
                    await getProposalData();
                    await getProposal();
                    await getIssueAmount();
                  })
    }
  }

  useEffect(() => { loadProposalData() }, [currentAddress, issueId]);
  useEffect(() => { updateUsersAddresses(proposalBepro) }, [proposalBepro, currentAddress]);

  return (
    <>
      <ProposalHero
        githubId={issueMicroService?.githubId}
        title={issueMicroService?.title}
        pullRequestId={proposalMicroService?.pullRequest.githubId}
        authorPullRequest={proposalBepro?.author}
        createdAt={proposalMicroService && formatDate(proposalMicroService.createdAt)}
        beproStaked={formatNumberToCurrency(amountIssue)}/>
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
        isIssueinDraft={issueMicroService?.state === `draft`}
        networkCID={networkCid}
        issueId={issueId as string}
        mergeId={mergeId as string}
        handleBeproService={getProposal}
        isDisputed={proposalBepro?.isDisputed}
        finished={isFinished} />
      <ProposalAddresses addresses={usersAddresses} currency="$BEPRO" />

      <ConnectWalletButton asModal={true} />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
