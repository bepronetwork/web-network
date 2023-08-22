import { CurrentUserState } from "interfaces/application-state";
import { IdsComment, TypeComment } from "interfaces/comments";
import { IssueDataComment } from "interfaces/issue-data";

import BountyCommentsView from "./view";

export default function Comments({
  comments = [],
  currentUser,
  type,
  ids,
  updateData,
}: {
  comments: IssueDataComment[];
  currentUser?: CurrentUserState;
  type: TypeComment;
  ids: IdsComment;
  updateData: (updatePrData?: boolean) => void;
}) {
  return (
    <BountyCommentsView
      comments={comments}
      currentUser={currentUser}
      type={type}
      ids={ids}
      updateData={updateData}
    />
  );
}
