import { useTranslation } from "next-i18next";

import ConnectWalletButton from "components/connect-wallet-button";

import { CurrentUserState } from "interfaces/application-state";
import { IdsComment, TypeComment } from "interfaces/comments";
import { IssueDataComment } from "interfaces/issue-data";

import Comment from "./comment/view";
import InputComment from "./input-comment/controller";

export default function BountyCommentsView({
  comments = [],
  currentUser,
  type,
  ids,
  updateData,
  disableCreateComment,
}: {
  comments: IssueDataComment[];
  currentUser?: CurrentUserState;
  type: TypeComment;
  ids: IdsComment;
  updateData: (updatePrData?: boolean) => void;
  disableCreateComment?: boolean;
}) {
  const { t } = useTranslation("common");

  return (
    <div className="mb-5">
      <div className="row justify-content-center">
        <div className="col">
          <div className="border-radius-8 p-3 bg-gray-900">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="caption-medium mb-0">{t("misc.comments")}</h5>
            </div>
            {!!comments.length &&
              comments?.map((data) => <Comment {...data} key={data?.id} />)}
            {currentUser?.walletAddress ? (
              !disableCreateComment ? (
                <InputComment
                  userAddress={currentUser?.walletAddress}
                  githubLogin={currentUser?.login}
                  type={type}
                  ids={ids}
                  updateData={updateData}
                />
              ) : null
            ) : (
              <div className="d-flex flex-column text-center mt-4 pt-2">
                <span>{t("comments.not-connect-wallet")}</span>
                <div className="d-flex justify-content-center mt-3 mb-1">
                  <ConnectWalletButton btnColor="primary" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
