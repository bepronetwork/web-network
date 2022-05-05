import { useTranslation } from "next-i18next";

import { formatDate } from "helpers/formatDate";

import { IssueDataComment } from "interfaces/issue-data";

import Avatar from "./avatar";
import MarkedRender from "./MarkedRender";

interface CommentsProps{
  comment: IssueDataComment;
}
export default function Comment({ comment }: CommentsProps) {
  const { t } = useTranslation("bounty");

  return (
    <div className="mb-3">
      <p className="caption-small text-uppercase mb-2">
        <Avatar userLogin={comment?.author} />

        <span className="ml-1">@{comment?.author} </span>

        <span className="trans ml-1">
          {comment?.updated_at && formatDate(comment?.updated_at)}
        </span>
      </p>

      <p className="p-small content-wrapper child mb-0 comment">
        <MarkedRender source={comment?.body || t("no-comments-available")} />
      </p>
    </div>
  );
}
