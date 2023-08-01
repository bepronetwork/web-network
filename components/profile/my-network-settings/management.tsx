import BountiesList from "components/bounty/bounties-list/controller";

export default function Management({
  bounties
}) {
  return <BountiesList bounties={bounties} variant="management" />;
}
