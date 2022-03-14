import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { GetServerSideProps } from 'next/types'
import React, { useContext, useEffect, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PageActions from '@components/page-actions'
import ProposalHero from '@components/proposal-hero'
import CustomContainer from '@components/custom-container'
import ProposalProgress from '@components/proposal-progress'
import ProposalAddresses from '@components/proposal-addresses'
import NotMergeableModal from '@components/not-mergeable-modal'
import ProposalProgressBar from '@components/proposal-progress-bar'
import ConnectWalletButton from '@components/connect-wallet-button'

import { useNetwork } from 'contexts/network'
import { ApplicationContext } from '@contexts/application'
import { useAuthentication } from '@contexts/authentication'

import {  formatDate } from '@helpers/formatDate'
import { isProposalDisputable } from '@helpers/proposal'
import { handlePercentage } from '@helpers/handlePercentage'
import { formatNumberToCurrency } from '@helpers/formatNumber'

import { ProposalData } from '@interfaces/api-response'
import { IssueData, pullRequest } from '@interfaces/issue-data'

import { changeOraclesParse, changeOraclesState } from '@reducers/change-oracles'

import { BeproService } from '@services/bepro-service'

import useApi from '@x-hooks/use-api'
import useOctokit from '@x-hooks/use-octokit'
interface ProposalBepro {
  disputes: string
  prAddresses: string[]
  prAmounts: number[]
  proposalAddress: string
  votes: string
  _id: string
  isDisputed?: boolean
  author?: string
}

interface usersAddresses {
  address: string
  githubLogin: string
  oracles: string
  percentage: number
}

export default function PageProposal() {
  const router = useRouter()
  const { t } = useTranslation('common')
  
  const [isCouncil, setIsCouncil] = useState(false)
  const [networkCid, setNetworkCid] = useState<string>()
  const [prGithubId, setPrGithubId] = useState<string>()
  const [disputableTime, setDisputableTime] = useState(0)
  const [isFinished, setIsFinished] = useState<boolean>()
  const [amountIssue, setAmountIssue] = useState<number>()
  const [isMergiable, setIsMergiable] = useState<boolean>()
  const [isFinalized, setIsFinalized] = useState<boolean>()
  const [issuePRs, setIssuePRs] = useState<pullRequest[]>()
  const [pullRequestGh, setPullRequestGh] = useState<pullRequest>()
  const [proposalBepro, setProposalBepro] = useState<ProposalBepro>()
  const [usersAddresses, setUsersAddresses] = useState<usersAddresses[]>()
  const [issueMicroService, setIssueMicroService] = useState<IssueData>(null)
  const [proposalMicroService, setProposalMicroService] = useState<ProposalData>()
  
  const { activeNetwork } = useNetwork()
  const { wallet, user, beproServiceStarted } = useAuthentication()
  const { dispatch, state: { beproStaked } } = useContext(ApplicationContext)
  
  const { getPullRequest } = useOctokit()
  const { getUserOf, getIssue } = useApi()

  const {prId, mergeId, dbId, issueId} = router.query

  async function getProposalData() {
    const [repoId, ghId] = String(issueId).split(`/`)
    const issueData = await getIssue(repoId, ghId, activeNetwork?.name)

    setIssueMicroService(issueData)
    setPrGithubId(issueData.pullRequests?.find(el => el.id === +prId).githubId)
    setProposalMicroService(issueData.mergeProposals.find(({scMergeId, issueId, pullRequestId}) => scMergeId === String(mergeId) && pullRequestId === +prId && issueId === +dbId))
    setAmountIssue(issueData?.amount?.toString())
  }

  async function getProposal(force = false) {
    if (!issueMicroService || !prGithubId || !beproServiceStarted)
      return

    try {
      const issue_id = await BeproService.network.getIssueByCID(String(issueId)).then(({_id}) => _id)
      const merge = await BeproService.network.getMergeById(issue_id, +mergeId)
      const isDisputed = await BeproService.network.isMergeDisputed(issue_id, +mergeId)
      const author = (await getUserOf(merge.proposalAddress))?.githubHandle
      const pullRequests = []

      for (const pullRequest of issueMicroService?.pullRequests) {
        const {data: {merged, mergeable, mergeable_state, number, state}} = await getPullRequest(+pullRequest.githubId, issueMicroService.repository?.githubPath)
        if (number === +prGithubId) {
          setIsMergiable(mergeable && mergeable_state === 'clean')
          //setPullRequestGh({...pullRequest, merged, isMergeable: mergeable && mergeable_state === 'clean', state})
        }

        pullRequests.push({...pullRequest, merged, isMergeable: mergeable && mergeable_state === 'clean', state, number})
      }

      setIssuePRs(pullRequests)
      setPullRequestGh(pullRequests.find(({ number }) => number === +prGithubId))
      setProposalBepro({...merge, isDisputed, author})

      return Promise.resolve()
    } catch (e) {
      console.error(`Error fetching Proposal for issue cid:${issueId} with merge:${mergeId}`, e)
    }
  }

  function getIssueAmount() {
    return BeproService.network.getIssueByCID(String(issueId))
                       .then(({_id}) => BeproService.network.getIssueById(_id))
                       .then(issue => {
                         setAmountIssue(issue.tokensStaked)
                         setNetworkCid(issue.cid)
                         setIsFinalized(issue.finalized)
                         setIsFinished(issue.recognizedAsFinished)
                       })
  }

  function updateUsersAddresses(proposal: ProposalBepro) {
    if (!proposal)
      return

    async function mapUser(address: string, i: number) {

      const {githubLogin} = await getUserOf(address)
      const oracles = proposal.prAmounts[i].toString()
      const percentage = handlePercentage(+oracles, +amountIssue)
      return {githubLogin, percentage, address, oracles}
    }

    Promise.all(proposal.prAddresses.map(mapUser)).then(setUsersAddresses)
  }

 async function loadProposalData() {
    if (issueId && wallet?.address && beproServiceStarted) {
      BeproService.getDisputableTime().then(setDisputableTime)
      BeproService.network.isCouncil(wallet?.address)
        .then(isCouncil => setIsCouncil(isCouncil))

      BeproService.network.getOraclesSummary(wallet?.address)
                  .then(oracles => dispatch(changeOraclesState(changeOraclesParse(wallet?.address, oracles))))
                  .then(async () => {
                    await getProposal()
                    await getProposalData()
                    await getIssueAmount()
                  })
    }
  }

  useEffect(() => { 
    loadProposalData() 
  }, [wallet?.address, issueId, beproServiceStarted])
  useEffect(() => { getProposal() }, [issueMicroService, prGithubId, beproServiceStarted])
  useEffect(() => { updateUsersAddresses(proposalBepro) }, [proposalBepro, wallet?.address])

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
          return await loadProposalData()
          }} />
      <ProposalAddresses addresses={usersAddresses} currency={t('$bepro')} />
      <NotMergeableModal
        currentGithubLogin={user?.login}
        issuePRs={issuePRs}
        currentAddress={wallet?.address}
        issue={issueMicroService}
        pullRequest={pullRequestGh}
        mergeProposal={proposalBepro}
        isFinalized={isFinalized}
        isCouncil={isCouncil}
      />
      <ConnectWalletButton asModal={true} />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'proposal', 'pull-request', 'connect-wallet-button'])),
    },
  }
}
