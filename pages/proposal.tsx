import {GetStaticProps} from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import PageActions from '@components/page-actions';
import ProposalAddresses from '@components/proposal-addresses';
import ProposalHero from '@components/proposal-hero';
import ProposalProgress from '@components/proposal-progress';
import {useRouter} from 'next/router';
import {ApplicationContext} from '@contexts/application';
import {BeproService} from '@services/bepro-service';
import GithubMicroService, {
  ProposalData,
  User,
} from '@services/github-microservice';
import {toNumber} from 'lodash';
import {formatDate} from '@helpers/formatDate';
import {handlePercentage} from '@helpers/handlePercentage';
import {IssueData} from '@interfaces/issue-data';
import {addToast} from '@reducers/add-toast';
import ProposalStepProgress from '@components/proposal-step-progress';

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
  const { dispatch, state: {currentAddress}, } = useContext(ApplicationContext);

  const [proposalBepro, setProposalBepro] = useState<ProposalBepro>();
  const [proposalMicroService, setProposalMicroService] = useState<ProposalData>();
  const [amountIssue, setAmountIssue] = useState<string>();
  const [usersAddresses, setUsersAddresses] = useState<usersAddresses[]>([
    {
      address: "teste1",
      githubLogin: "teste1",
      oracles: "10",
      percentage: 20,
    },
    {
      address: "teste1",
      githubLogin: "teste1",
      oracles: "10",
      percentage: 30,
    },
    {
      address: "teste1",
      githubLogin: "teste1",
      oracles: "10",
      percentage: 50,
    },
  ]);
  const [issueMicroService, setIssueMicroService] = useState<IssueData>();

  async function getProposalData() {
    const mergeProposal = await GithubMicroService.getMergeProposalIssue(issueId, id);
    const issueData = await GithubMicroService.getIssueId(issueId);
    setProposalMicroService(mergeProposal as ProposalData);
    setIssueMicroService(issueData);

    console.log(`mergeProposal`, mergeProposal,);
    console.log(`issueData`, issueData,);

    return Promise.resolve();
  }

  async function getProposal() {
    const mergeId = id;

    try {
      const merge = await BeproService.network.getMergeById({issue_id: issueId, merge_id: (+id - 1).toString()});
      const isDisputed = await BeproService.network.isMergeDisputed({issueId, mergeId: (+id - 1).toString(),});
      const author = await GithubMicroService.getHandleOf(merge.proposalAddress);

      setProposalBepro({...merge, isDisputed, author});
      return Promise.resolve();
    } catch (e) {
      console.error(`Error fetching Proposal for issue ${issueId} with merge ${mergeId}`, e);
    }
  }

  function getIssueAmount() {
    BeproService.network.getIssueById({issueId: id})
                .then(issue => setAmountIssue(issue.tokensStaked))
  }

  async function joinUserAddresses() {
    console.log(`Proposal changed`, proposalBepro);
    if (!proposalBepro)
      return;

    const users = [];

    for (const [i, address] of proposalBepro.prAddresses.entries()) {
      const {githubLogin} = await GithubMicroService.getUserOf(address);
      const oracles = proposalBepro.prAmounts[i];
      const percentage = handlePercentage(+oracles, +amountIssue);

      users.push({githubLogin, percentage, address, oracles});
    }

    setUsersAddresses(users);
    console.log(`users`, users)
  }

  function initialize() {
    if (issueId && id && currentAddress) {
      getProposalData()
        .then(_ => getProposal())
        .then(_ => getIssueAmount())
    }
  }

  useEffect(() => { initialize() }, [currentAddress, id, issueId]);
  useEffect(() => { joinUserAddresses() }, [proposalBepro]);

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
      <ProposalStepProgress/>
      <PageActions
        state={'pull request'}
        developers={[]}
        finalized={false}
        isIssueinDraft={false}
        addressNetwork={'0xE1Zr7u'}
        issueId={issueId?.toString()}
        mergeId={id?.toString()}
        handleBeproService={getProposal}
        isDisputed={proposalBepro?.isDisputed}
        UrlGithub={`https://github.com/bepronetwork/bepro-js-edge/pull/${proposalMicroService?.pullRequest.githubId}`}
      />

      <ProposalAddresses addresses={usersAddresses} />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
