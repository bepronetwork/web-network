import { useEffect, useState } from "react";

import { useRepos } from "contexts/repos";

export default function useGithubRepo(id: string, path: string) {
  const [githubPath, setGithubPath] = useState("");
  const { findRepo } = useRepos();

  function loadRepoId() {
    if (!id) return;

    setGithubPath(findRepo(+id)?.githubPath);
  }

  useEffect(loadRepoId, [id]);
  useEffect(() => setGithubPath(path), [path]);

  return [githubPath, loadRepoId];
}
