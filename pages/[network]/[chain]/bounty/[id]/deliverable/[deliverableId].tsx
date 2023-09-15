import { useState } from "react";

import { SSRConfig, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import ConnectWalletButton from "components/connect-wallet-button";
import DeliverableBody from "components/deliverable/body/controller";
import CreateReviewModal from "components/deliverable/create-review-modal/controller";
import DeliverableHero from "components/deliverable/hero/controller";

import { useAppState } from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";

import { commentsParser, deliverableParser, issueParser } from "helpers/issue";

import {
  Deliverable,
  IssueBigNumberData,
  IssueData,
} from "interfaces/issue-data";

import { getCommentsData, CreateComment } from "x-hooks/api/comments";
import getDeliverable from "x-hooks/api/deliverable/get-deliverable";
import useReactQuery from "x-hooks/use-react-query";

interface PageDeliverableProps {
  bounty: IssueData;
  deliverable: Deliverable;
  _nextI18Next?: SSRConfig;
}

export default function DeliverablePage({ deliverable, bounty }: PageDeliverableProps) {
  const router = useRouter();
  const { t } = useTranslation(["common", "deliverable"]);

  const { review, deliverableId } = router.query;

  const { data: deliverableData, invalidate: invalidateDeliverable } = 
  useReactQuery(["deliverable", +deliverableId], () => getDeliverable(+deliverableId));  

  const [showModal, setShowModal] = useState(!!review);
  const [currentBounty, setCurrentBounty] = useState<IssueBigNumberData>(issueParser(bounty));
  const [currentDeliverable, setCurrentDeliverable] = 
    useState<Deliverable>(deliverableParser(deliverable, bounty?.mergeProposals));

  const [isCreatingReview, setIsCreatingReview] = useState(false);

  const { state, dispatch } = useAppState();

  const isDeliverableReady = !!currentDeliverable?.markedReadyForReview;

  function updateBountyData() {
    const { deliverableId } = router.query;

    getDeliverable(+deliverableId)
      .then(deliverable => {
        setCurrentBounty(issueParser(deliverable?.issue));
        setCurrentDeliverable(deliverableParser(deliverable, deliverable?.issue?.mergeProposals));
      })
  }

  function updateCommentData() {
    getCommentsData({ deliverableId: currentDeliverable?.id.toString() })
     .then((comments) => setCurrentDeliverable({
      ...currentDeliverable,
      comments: commentsParser(comments)
     }))
  }

  function handleCreateReview(body: string) {
    if (!state.currentUser?.walletAddress) return;

    setIsCreatingReview(true);

    CreateComment({
      type: 'review',
      issueId: +currentBounty.id,
      deliverableId: currentDeliverable.id,
      comment: body
    }).then(() => {
      dispatch(addToast({
        type: "success",
        title: t("actions.success"),
        content: t("deliverable:actions.review.success"),
      }));
      updateCommentData()
      setShowModal(false)
    }).catch(() => {
      dispatch(addToast({
        type: "danger",
        title: t("actions.failed"),
        content: t("deliverable:actions.review.error"),
      }));
    })
    .finally(() => {
      setIsCreatingReview(false);
    });
  }

  function handleShowModal() {
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  return (
    <>
      <DeliverableHero currentDeliverable={currentDeliverable} currentBounty={currentBounty} />

      <DeliverableBody 
        currentDeliverable={currentDeliverable} 
        currentBounty={currentBounty} 
        isCreatingReview={isCreatingReview} 
        updateBountyData={updateBountyData}
        updateComments={updateCommentData}
        handleShowModal={handleShowModal}      
      />

      <CreateReviewModal
        show={showModal && isDeliverableReady}
        currentBounty={currentBounty} 
        deliverable={currentDeliverable}
        isExecuting={isCreatingReview}
        onConfirm={handleCreateReview}
        onCloseClick={handleCloseModal}
      />

      <ConnectWalletButton asModal={true}/>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({query, locale}) => {
  const { deliverableId } = query;

  const Dbdeliverable = await getDeliverable(+deliverableId);

  return {
    props: {
      bounty: Dbdeliverable.issue,
      deliverable: Dbdeliverable,
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "proposal",
        "deliverable",
        "connect-wallet-button",
        "funding"
      ]))
    }
  };
};