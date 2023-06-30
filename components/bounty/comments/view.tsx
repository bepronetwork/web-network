import { useTranslation } from "next-i18next";

import ExternalLinkIcon from "assets/icons/external-link-icon";

import Button from "../../button";
import Comment from "../../comment";

export default function BountyCommentsView({ comments = [], replyRef }) {
  const { t } = useTranslation("common");

  return (
    <div className="mb-5">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="content-wrapper bg-gray-850">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="caption-small mb-0">
                {t("misc.comments", { count: comments?.length || 0 })}
              </h5>
              <a
                href={replyRef}
                className="text-decoration-none"
                target="_blank"
                rel="noreferrer"
              >
                <Button transparent textClass="text-primary">
                  {t("actions.reply-on-github")}{" "}
                  <ExternalLinkIcon className="ml-1" color="primary" />
                </Button>
              </a>
            </div>
            {!!comments.length && comments?.map((comment) => (
              <Comment comment={comment} key={comment?.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}