import { ChangeEvent, useState } from "react";

import { IssueBigNumberData, PullRequest } from "interfaces/issue-data";

import CreateReviewModalView from "./view";

interface CreateReviewModalModalProps {
  show: boolean;
  isExecuting: boolean;
  onConfirm: (body: string) => void;
  onCloseClick: () => void;
  pullRequest: PullRequest;
  currentBounty: IssueBigNumberData;
}

export default function CreateReviewModal({
  show = false,
  isExecuting = false,
  onConfirm,
  onCloseClick,
  pullRequest,
  currentBounty
}: CreateReviewModalModalProps) {

  const [body, setBody] = useState("");

  function isButtonDisabled(): boolean {
    return body.trim() === "" || isExecuting;
  }

  function handleOnCloseClick() {
    onCloseClick();
    setBody("");
  }

  function handleConfirm() {
    onConfirm(body);
  }

  function handleChangeBody(e: ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value)
  }

  return (
    <CreateReviewModalView 
      show={show} 
      isExecuting={isExecuting} 
      onCloseClick={handleOnCloseClick} 
      pullRequest={pullRequest} 
      currentBounty={currentBounty} 
      body={body} 
      handleChangeBody={handleChangeBody} 
      isButtonDisabled={isButtonDisabled} 
      handleConfirm={handleConfirm}    
    />
  );
}