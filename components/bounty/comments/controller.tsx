import BountyCommentsView from "./view";

export default function BountyComments({
  comments = [],
  repo,
  issueId,
}) {
  const replyRef =
    (comments?.length > 0 && comments[0]?.html_url) ||
    `https://github.com/${repo}/issues/${issueId}`;

  return <BountyCommentsView comments={comments} replyRef={replyRef} />;
}
