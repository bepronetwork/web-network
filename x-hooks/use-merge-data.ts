import useApi from '@x-hooks/use-api';
import useOctokit from '@x-hooks/use-octokit';
import {IssueData} from '@interfaces/issue-data';
import useRepos from '@x-hooks/use-repos';
import {useEffect} from 'react';

interface MergeProps {
  repoId: string;
  githubId: string;
  path: string;
}

export default function useMergeData() {
  const [[, repoList], {loadRepos}] = useRepos();
  const db = useApi();
  const octokit = useOctokit();

  async function getIssue(repoId: string, githubId: string, path: string): Promise<IssueData> {
    const apiData = await db.getIssue(repoId, githubId);
    const {data: {title, body}} = await octokit.getIssue(+githubId, path);

    return {...apiData, title, body};
  }

  async function getIssues(page = '1',
                                   repoId = '',
                                   time = ``,
                                   state = ``,
                                   sortBy = 'updatedAt',
                                   order = 'DESC') {

    const data = await db.getIssues(page, repoId, time, state, sortBy, order);
    const list = repoList.length ? repoList : (await loadRepos());

    for (let i = 0; i < data.rows.length; i++) {
      const issue = data.rows[i];
      const {githubPath} = list.find(({id}) => id === issue.repository_id);
      const {data: {title, body}} = await octokit.getIssue(+issue.githubId, githubPath);
      Object.assign(issue, {title, body})
    }

    return data;
  }

  return {getIssue, getIssues}
}
