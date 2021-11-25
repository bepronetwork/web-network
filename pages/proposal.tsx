import {GetStaticProps} from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import PageActions from '@components/page-actions';
import ProposalAddresses from '@components/proposal-addresses';
import ProposalHero from '@components/proposal-hero';
import ProposalProgress from '@components/proposal-progress';
import {useRouter} from 'next/router';
import {ApplicationContext} from '@contexts/application';
import {BeproService} from '@services/bepro-service';
import {ProposalData} from '@services/github-microservice';
import {formatDate} from '@helpers/formatDate';
import {handlePercentage} from '@helpers/handlePercentage';
import {IssueData, pullRequest} from '@interfaces/issue-data';
import ProposalProgressBar from '@components/proposal-progress-bar';
import {changeOraclesParse, changeOraclesState} from '@reducers/change-oracles';
import CustomContainer from '@components/custom-container';
import {formatNumberToCurrency} from '@helpers/formatNumber';
import ConnectWalletButton from '@components/connect-wallet-button';
import useRepos from '@x-hooks/use-repos';
import useApi from '@x-hooks/use-api';
import useMergeData from '@x-hooks/use-merge-data';
import NotMergeableModal from '@components/not-mergeable-modal';
import useOctokit from '@x-hooks/use-octokit';

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
  const { dispatch, state: {currentAddress, beproStaked, githubLogin}, } = useContext(ApplicationContext);

  const [proposalBepro, setProposalBepro] = useState<ProposalBepro>();
  const [proposalMicroService, setProposalMicroService] = useState<ProposalData>();
  const [amountIssue, setAmountIssue] = useState<string>();
  const [networkCid, setNetworkCid] = useState<string>();
  const [isFinalized, setIsFinalized] = useState<boolean>();
  const [isFinished, setIsFinished] = useState<boolean>();
  const [prGithubId, setPrGithubId] = useState<string>();
  const [isMergiable, setIsMergiable] = useState<boolean>();
  const [pullRequestGh, setPullRequestGh] = useState<pullRequest>();
  const [issuePRs, setIssuePRs] = useState<pullRequest[]>();
  const [isCouncil, setIsCouncil] = useState(false);
  const [usersAddresses, setUsersAddresses] = useState<usersAddresses[]>();
  const [issueMicroService, setIssueMicroService] = useState<IssueData>(null);
  const [repo, setRepo] = useState(``);
  const [[activeRepo, repoList], {findRepo, loadRepos}] = useRepos();
  const {getUserOf, getPullRequestIssue} = useApi();
  const {getIssue,} = useMergeData();
  const {getPullRequest} = useOctokit();

  async function getProposalData() {
    const [repoId, ghId] = String(issueId).split(`/`);
    const repos = await loadRepos();
    const _repo = repos.find(({id}) => id === +repoId);

    const issueData = await getIssue(repoId, ghId, _repo?.githubPath);

    setRepo(_repo?.githubPath)
    setIssueMicroService(issueData);
    setPrGithubId(issueData.pullRequests?.find(el => el.id === +prId).githubId);
    setProposalMicroService(issueData.mergeProposals.find(({scMergeId, issueId, pullRequestId}) => scMergeId === String(mergeId) && pullRequestId === +prId && issueId === +dbId));
    setAmountIssue(issueData?.amount?.toString())
  }

  async function getProposal(force = false) {

    try {
      const issue_id = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);
      const merge = await BeproService.network.getMergeById({issue_id: issue_id, merge_id: mergeId});
      const isDisputed = await BeproService.network.isMergeDisputed({issueId: issue_id, mergeId});
      const author = (await getUserOf(merge.proposalAddress))?.githubHandle;
      const pullRequests = [];

      for (const pullRequest of issueMicroService?.pullRequests) {
        const {data: {merged, mergeable, number, state}} = await getPullRequest(+pullRequest.githubId, issueMicroService.repo);
        if (number === +prGithubId) {
          setIsMergiable(mergeable);
          setPullRequestGh({...pullRequest, merged, isMergeable: mergeable, state});
        }

        pullRequests.push({...pullRequest, merged, isMergeable: mergeable, state})
      }

      setIssuePRs(pullRequests)
      setProposalBepro({...merge, isDisputed, author});

      return Promise.resolve();
    } catch (e) {
      console.error(`Error fetching Proposal for issue cid:${issueId} with merge:${mergeId}`, e);
    }
  }

  function getIssueAmount() {
    return BeproService.network.getIssueByCID({issueCID: issueId})
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

      const {githubLogin} = await getUserOf(address);
      const oracles = proposal.prAmounts[i].toString();
      const percentage = handlePercentage(+oracles, +amountIssue);
      return {githubLogin, percentage, address, oracles};
    }

    Promise.all(proposal.prAddresses.map(mapUser)).then(setUsersAddresses)
  }

  function loadProposalData() {
    if (issueId && currentAddress) {
      BeproService.network.isCouncil({address: currentAddress})
        .then(isCouncil => setIsCouncil(isCouncil))

      BeproService.network.getOraclesSummary({address: currentAddress})
                  .then(oracles => dispatch(changeOraclesState(changeOraclesParse(currentAddress, oracles))))
                  .then(getProposalData)
                  .then(getProposal)
                  .then(getIssueAmount)
      // .then(async () => {
      //   await getProposalData();
      //   await getProposal();
      //   await getIssueAmount();
      // })
    }
  }

  useEffect(() => { loadProposalData() }, [currentAddress, issueId,]);
  useEffect(() => { updateUsersAddresses(proposalBepro) }, [proposalBepro, currentAddress]);
  useEffect(() => { setRepo(activeRepo?.githubPath) }, [activeRepo])

  return (
    <>
      <ProposalHero
        githubId={issueMicroService?.githubId}
        title={issueMicroService?.title}
        pullRequestId={prGithubId}
        authorPullRequest={pullRequestGh?.githubLogin}
        createdAt={proposalMicroService && formatDate(proposalMicroService.createdAt)}
        beproStaked={formatNumberToCurrency(amountIssue)}/>
      <ProposalProgress developers={usersAddresses}/>
      <CustomContainer className="mgt-20 mgb-20">
        <div className="col-6">
          <ProposalProgressBar issueDisputeAmount={+proposalBepro?.disputes} isDisputed={proposalBepro?.isDisputed} stakedAmount={+beproStaked} isFinished={isFinalized} />
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
        githubId={prGithubId}
        repoPath={repo}
        canClose={isMergiable}
        finished={isFinished} />
      <ProposalAddresses addresses={usersAddresses} currency="$BEPRO" />
      <NotMergeableModal
        currentGithubLogin={githubLogin}
        issuePRs={issueMicroService?.pullRequests}
        currentAddress={currentAddress}
        issue={issueMicroService}
        pullRequest={pullRequestGh}
        mergeProposal={proposalBepro}
        isFinalized={isFinalized}
        isCouncil={isCouncil}
      />
      <ConnectWalletButton asModal={true} />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
