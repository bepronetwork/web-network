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
import {IssueData} from '@interfaces/issue-data';
import ProposalProgressBar from '@components/proposal-progress-bar';
import {changeOraclesParse, changeOraclesState} from '@reducers/change-oracles';
import CustomContainer from '@components/custom-container';
import {formatNumberToCurrency} from '@helpers/formatNumber';
import ConnectWalletButton from '@components/connect-wallet-button';
import useRepos from '@x-hooks/use-repos';
import useApi from '@x-hooks/use-api';
import useMergeData from '@x-hooks/use-merge-data';
import Modal from '@components/modal';
import Button from '@components/button';
import GithubLink from '@components/github-link';

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
  const [prGithubId, setPrGithubId] = useState<string>();
  const [isMergiable, setIsMergiable] = useState<boolean>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [usersAddresses, setUsersAddresses] = useState<usersAddresses[]>();
  const [issueMicroService, setIssueMicroService] = useState<IssueData>(null);
  const [repo, setRepo] = useState(``);
  const [[activeRepo, repoList], {findRepo, loadRepos}] = useRepos();
  const {getUserOf, getPullRequestIssue} = useApi();
  const {getIssue,} = useMergeData();

  async function getProposalData() {
    const [repoId, ghId] = String(issueId).split(`/`);
    const repos = await loadRepos();
    const _repo = repos.find(({id}) => id === +repoId);

    const issueData = await getIssue(repoId, ghId, _repo?.githubPath);

    setRepo(_repo?.githubPath)
    setIssueMicroService(issueData);
    setPrGithubId(issueData.pullRequests[0].githubId);
    setProposalMicroService(issueData.mergeProposals.find(({id}) => id === +dbId));
    setAmountIssue(issueData?.amount?.toString())
  }

  async function getProposal(force = false) {

    try {
      const issue_id = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);
      const merge = await BeproService.network.getMergeById({issue_id: issue_id, merge_id: mergeId});
      const isDisputed = await BeproService.network.isMergeDisputed({issueId: issue_id, mergeId});
      const author = (await getUserOf(merge.proposalAddress))?.githubHandle;

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
      getPullRequestIssue(issueId.toString()).then((pr: any)=>{
        setIsMergiable(pr.isMergeable)
        setShowModal(!pr.isMergeable)
      })

      BeproService.network.getOraclesSummary({address: currentAddress})
                  .then(oracles => dispatch(changeOraclesState(changeOraclesParse(currentAddress, oracles))))
                  .then(async () => {
                    await getProposalData();
                    await getProposal();
                    await getIssueAmount();
                  })
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
        pullRequestId={proposalMicroService?.pullRequest?.githubId}
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
        githubId={prGithubId}
        repoPath={repo}
        canClose={isMergiable}
        finished={isFinished} />
      <ProposalAddresses addresses={usersAddresses} currency="$BEPRO" />

      <Modal show={showModal} title="Proposal cannot be accepted" titlePosition="center">
        <div>
          <div className="d-flex justify-content-center m-2 text-center">
            <p className="smallCaption trans mb-2 text-white-50 text-uppercase">this proposal has github conflicts and cannot be merged. please, fix it before doing so.</p>
          </div>
          <div className="d-flex justify-content-center">
            <Button color='dark-gray' onClick={() => setShowModal(false)}>cancel</Button>
            <GithubLink forcePath={repo} hrefPath={`pull/${prGithubId || ""}/conflicts`} color='primary'>View on github</GithubLink>
          </div>
        </div>
      </Modal>
      <ConnectWalletButton asModal={true} />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
