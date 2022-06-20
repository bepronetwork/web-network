import IssueAvatars from "components/issue-avatars";
import Translation from "components/translation";

import { ForkInfo } from "interfaces/repos-list";

interface ForksAvatarsProps {
  repositoryPath: string;
  forks: ForkInfo[];
}

export default function ForksAvatars({
  repositoryPath,
  forks
}: ForksAvatarsProps) {

  if (!forks.length) return <></>;

  return (
    <a
      className="d-flex align-items-center text-decoration-none text-white-50"
      href={`https://github.com/${repositoryPath}/network/members`}
      target="_blank"
      rel="noreferrer"
    >
      <IssueAvatars users={forks} />
      <span className="caption-small">
        <Translation label="misc.forks" />
      </span>
    </a>
  );
}