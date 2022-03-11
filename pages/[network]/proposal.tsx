import {getSession} from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {GetServerSideProps} from 'next/types';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import useApi from '@x-hooks/use-api';
import { useIssue } from '@contexts/issue';
import { useRouter } from 'next/router';
import { Proposal } from '@interfaces/proposal';
import ProposalHero from '@components/proposal-hero';

export default function PageProposal() {
  const router = useRouter()
  const {getProposal} = useApi()

  const [proposal, setProposal] = useState<Proposal>({} as Proposal)

  async function loadData(){
    const {proposalId} = router.query
    if(!proposalId) return;
    getProposal(`${proposalId}`)
    .then((data)=> setProposal(data))
  }
  useEffect(()=>{
    loadData();
  },[router.query])
  return (
    <>
      <ProposalHero proposal={proposal} />
      {/* <ProposalProgress developers={usersAddresses}/>
      <CustomContainer className="mgt-20 mgb-20">
        <div className="col-6">
          <ProposalProgressBar issueDisputeAmount={+proposalBepro?.disputes} isDisputed={proposalBepro?.isDisputed} stakedAmount={+beproStaked} isFinished={isFinalized} isCurrentPRMerged={issueMicroService?.merged === mergeId} />
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
        isDisputed={proposalBepro?.isDisputed}
        githubId={prGithubId}
        repoPath={issueMicroService?.repository?.githubPath}
        canClose={isMergiable}
        finished={isFinished}
        isDisputable={isProposalDisputable(proposalMicroService?.createdAt, disputableTime)}
        onCloseEvent={async () => {
          return await loadProposalData();
          }} />
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
