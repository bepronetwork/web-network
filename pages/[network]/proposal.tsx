import {getSession} from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {GetServerSideProps} from 'next/types';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import { useIssue } from 'contexts/issue';
import { useRouter } from 'next/router';
import { INetworkProposal, Proposal } from 'interfaces/proposal';
import ProposalHero from 'components/proposal-hero';
import useNetworkTheme from 'x-hooks/use-network';
import useApi from '@x-hooks/use-api';
import ProposalPullRequestDetail from '@components/proposal-pullrequest-details';
import { pullRequest } from '@interfaces/issue-data';

export default function PageProposal() {
  const router = useRouter()
  const {getUserOf} = useApi()
  const {activeIssue, networkIssue} = useIssue()
  const { getURLWithNetwork } = useNetworkTheme();
  const [proposal, setProposal] = useState<Proposal>({} as Proposal)
  const [networkProposal, setNetworkProposal] = useState<INetworkProposal>({} as INetworkProposal)
  const [pullRequest, setPullRequest] = useState<pullRequest>({} as pullRequest)

  async function loadData(){
    const {proposalId, id: issueId, repoId} = router.query
    const mergeProposal = activeIssue?.mergeProposals.find(p=> +p.id === +proposalId)
    const networkProposals = networkIssue?.networkProposals?.[+proposalId];
    
    
    if(!mergeProposal || !networkProposals){
      if(issueId && repoId){
        return router?.push(getURLWithNetwork('/bounty',{
          id: issueId,
          repoId: repoId
        }))
      }
      
      return router?.push('/404');
    }

    const PR = activeIssue?.pullRequests.find(pr=> pr.id === mergeProposal?.pullRequestId)
    setPullRequest(PR)
    setProposal(mergeProposal)
    setNetworkProposal(networkProposals)
  }

    
  useEffect(()=>{
    loadData();
  },[router.query, activeIssue, networkIssue])

  return (
    <>
      <ProposalHero proposal={proposal}  networkProposal={networkProposal}/>
      <div className='mt-3'>
        <ProposalPullRequestDetail proposal={proposal}  networkProposal={networkProposal} currentPullRequest={pullRequest}/>
      </div>
      {/* <CustomContainer className="mgt-20 mgb-20">
        <div className="col-6">
          <ProposalProgressBar issueDisputeAmount={+proposalBepro?.disputes} isDisputed={proposalBepro?.isDisputed} stakedAmount={+beproStaked} isFinished={isFinalized} isCurrentPRMerged={issueMicroService?.merged === mergeId} />
        </div>
      </CustomContainer>
      <ProposalAddresses addresses={usersAddresses} currency={t('$bepro')} />
      <NotMergeableModal
        currentGithubLogin={githubLogin}
        issuePRs={issuePRs}
        currentAddress={currentAddress}
        issue={issueMicroService}
        pullRequest={pullRequestGh}
        mergeProposal={proposalBepro}
        isFinalized={isFinalized}
        isCouncil={isCouncil}
      />
      <ConnectWalletButton asModal={true} /> */}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'proposal', 'pull-request', 'connect-wallet-button'])),
    },
  };
};
