import { ChangeEvent, useState } from "react";

import { Deliverable, IssueBigNumberData } from "interfaces/issue-data";

import CreateReviewModalView from "./view";

interface CreateReviewModalModalProps {
  show: boolean;
  isExecuting: boolean;
  onConfirm: (body: string) => void;
  onCloseClick: () => void;
  deliverable: Deliverable;
  currentBounty: IssueBigNumberData;
}

export default function CreateReviewModal({
  show = false,
  isExecuting = false,
  onConfirm,
  onCloseClick,
  deliverable,
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
      deliverable={deliverable} 
      currentBounty={currentBounty} 
      body={body} 
      handleChangeBody={handleChangeBody} 
      isButtonDisabled={isButtonDisabled} 
      handleConfirm={handleConfirm}    
    />
  );
}