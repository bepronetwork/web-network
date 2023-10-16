import { ChangeEvent, useState } from "react";

import { useTranslation } from "next-i18next";

import { useAppState } from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";

import { IdsComment, TypeComment } from "interfaces/comments";

import { CreateComment } from "x-hooks/api/comments";

import InputCommentView from "./view";


export default function InputComment({
  githubLogin,
  userAddress,
  type,
  ids,
  updateData
}: {
  githubLogin?: string;
  userAddress: string;
  type: TypeComment;
  ids: IdsComment;
  updateData: (updatePrData?: boolean) => void;
}) {
  const { t } = useTranslation(["common", "bounty"]);
  const [comment, setComment] = useState<string>();
  const { dispatch } = useAppState();

  function onCommentChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setComment(e.target.value)
  }

  async function onCommentSubmit() {
    await CreateComment({
      comment,
      ...ids,
      type
    }).then(() => {
      dispatch(addToast({
        type: "success",
        title: t("actions.success"),
        content: t("bounty:actions.comment.success"),
      }));
      updateData()
      setComment("")
    }).catch(() => {
      dispatch(addToast({
        type: "danger",
        title: t("actions.success"),
        content: t("bounty:actions.comment.error"),
      }));
    })
  }

  return (
    <InputCommentView
      githubLogin={githubLogin}
      userAddress={userAddress}
      comment={comment}
      onCommentChange={onCommentChange}
      onCommentSubmit={onCommentSubmit}
    />
  );
}
