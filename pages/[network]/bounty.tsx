import React, {useEffect, useState} from "react";

import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import {GetServerSideProps} from "next/types";

import BountyHero from "components/bounty-hero";
import FundingSection from "components/bounty/funding-section";
import IssueBody from "components/bounty/issue-body";
import TabSections from "components/bounty/tabs-sections";
import IssueComments from "components/issue-comments";
import PageActions from "components/page-actions";

import {useAppState} from "contexts/app-state";
import {BountyEffectsProvider} from "contexts/bounty-effects";

import { useAuthentication } from "x-hooks/use-authentication";
import {useBounty} from "x-hooks/use-bounty";
import useOctokit from "x-hooks/use-octokit";

export default function PageIssue() {
  useBounty();
  const router = useRouter();

  const [commentsIssue, setCommentsIssue] = useState([]);
  const [isRepoForked, setIsRepoForked] = useState<boolean>();
  const [isEditIssue, setIsEditIssue] = useState<boolean>(false);
  const { signMessageIfCreatorIssue } = useAuthentication();

  const {state} = useAppState();

  const { getUserRepository } = useOctokit();

  const { id } = router.query;

  async function handleEditIssue() {
    const isCreator = await signMessageIfCreatorIssue()

    if(isCreator){
      setIsEditIssue(true)
    }
  }

  function handleCancelEditIssue() {
    setIsEditIssue(false)
  }

  function checkForks(){
    if (!state.Service?.network?.repos?.active?.githubPath || isRepoForked !== undefined) return;

    if (state.currentBounty?.data?.working?.includes(state.currentUser?.login))
      return setIsRepoForked(true);

    const [, activeName] = state.Service.network.repos.active.githubPath.split("/");
  
    getUserRepository(state.currentUser?.login, activeName)
    .then(repository => {
      const { isFork, nameWithOwner, parent } = repository;

      setIsRepoForked(isFork && parent?.nameWithOwner === state.Service.network.repos.active.githubPath ||
        nameWithOwner.startsWith(`${state.currentUser?.login}/`));
    })
    .catch((e) => {
      setIsRepoForked(false);
      console.log("Failed to get users repositories: ", e);
    });
  }

  function addNewComment(comment) {
    setCommentsIssue([...commentsIssue, comment]);
  }

  useEffect(() => {
    if (state.currentBounty?.comments) setCommentsIssue([...state.currentBounty?.comments || []]);
  }, [ state.currentBounty?.data, state.Service?.network?.repos?.active ]);

  useEffect(() => {
    if (!state.currentUser?.login ||
        !state.currentUser?.walletAddress ||
        !state.Service?.network?.repos?.active ||
        !state.currentBounty?.data ||
        isRepoForked !== undefined) 
      return;
    checkForks();
  },[state.currentUser?.login, 
     state.currentBounty?.data?.working, 
     state.Service?.network?.repos?.active,
     !state.currentUser?.walletAddress
  ]);

  return (
    <BountyEffectsProvider>
      <BountyHero />

      { state.currentBounty?.chainData?.isFundingRequest && state.currentBounty?.data?.fundingAmount ? 
      <FundingSection /> : null}

      <PageActions
        isRepoForked={!!isRepoForked}
        addNewComment={addNewComment}
        handleEditIssue={handleEditIssue}
        isEditIssue={isEditIssue}
      />

      {(state.currentUser?.walletAddress)
        ? <TabSections/>
        : null
      }

      <IssueBody 
        isEditIssue={isEditIssue} 
        description={state.currentBounty?.data?.body}
        cancelEditIssue={handleCancelEditIssue}
        />

      <IssueComments
        comments={commentsIssue}
        repo={state.currentBounty?.data?.repository?.githubPath}
        issueId={id}
      />
    </BountyEffectsProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "proposal",
        "pull-request",
        "connect-wallet-button",
        "funding"
      ]))
    }
  };
};
