import { GetStaticProps } from "next";
import Button from "./button";
import ExternalLinkIcon from "@assets/icons/external-link-icon";
import Comment from "./comment";
import { useTranslation } from "next-i18next";

export default function IssueComments({ comments, repo, issueId }) {
  const replyRef = comments?.length > 0 && comments[0]?.html_url || `https://github.com/${repo}/issues/${issueId}`
  const { t } = useTranslation('common')

  return (
    <div className="container mb-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="content-wrapper">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="caption-large mb-0">{t('misc.comments', {count: comments?.length})}</h3>
              <a href={replyRef} className="text-decoration-none" target="_blank">
                  <Button transparent textClass="text-primary">{t('actions.reply-on-github')} <ExternalLinkIcon className="ml-1" color="primary"/></Button>
              </a>
            </div>
            {comments?.map((comment) => <Comment comment={comment} key={comment.id} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
