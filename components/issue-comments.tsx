import { GetStaticProps } from "next";
import Link from "next/link";
import { formatDate } from '@helpers/formatDate';

export default function IssueComments({ comments }) {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="content-wrapper">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="smallCaption mb-0">{comments?.length} comments</h3>
              {comments?.length > 0 && (
                <Link href={comments[0]?.html_url} passHref>
                  <a className="subnav-github" target="_blank">
                    {"Reply on github".toUpperCase()}
                  </a>
                </Link>
              )}
            </div>
            {comments?.map((comment) => (
              <div className="content-wrapper child mb-3" key={comment?.id}>
                <p className="p-small trans">
                  @{comment?.user.login}{" "}
                  {comment?.updated_at && formatDate(comment?.updated_at)}
                </p>
                <p className="p-small">{comment?.body}</p>
              </div>
            ))}
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
