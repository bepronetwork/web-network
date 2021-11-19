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

const OctoData = {};

export default function useMergeData() {
  const [[, repoList], {loadRepos}] = useRepos();
  const db = useApi();
  const octokit = useOctokit();

  async function mergeData(data: IssueData[]) {
    const list = repoList.length ? repoList : (await loadRepos());

    for (let i = 0; i < data.length; i++) {
      const issue = data[i];
      if (OctoData[`${issue.githubId}/${issue.repository_id}`])
        Object.assign(issue, OctoData[`${issue.githubId}/${issue.repository_id}`]);
      else {
        const {githubPath: repo} = list.find(({id}) => id === issue.repository_id);
        const {data: {title, body, comments}} = await octokit.getIssue(+issue.githubId, repo);
        OctoData[`${issue.githubId}/${issue.repository_id}`] = {title, body, repo, numberOfComments: comments};
        Object.assign(issue, {title, body, repo, numberOfComments: comments})
      }
    }
  }

  async function getIssue(repoId: string, githubId: string, path: string): Promise<IssueData> {
    const apiData = await db.getIssue(repoId, githubId);

    if (OctoData[`${apiData.githubId}/${apiData.repository_id}`])
      Object.assign(apiData, OctoData[`${apiData.githubId}/${apiData.repository_id}`]);

    const {data: {title, body}} = await octokit.getIssue(+githubId, path);
    OctoData[`${apiData.githubId}/${apiData.repository_id}`] = {title, body, repo: path}

    return {...apiData, title, body, repo: path};
  }

  async function getIssues({
                             page = '1',
                             repoId = '',
                             time = ``,
                             state = ``,
                             sortBy = 'updatedAt',
                             order = 'DESC',
                             address = ``,
                             creator = ``
                           }) {

    const data = await db.getIssues(page, repoId, time, state, sortBy, order, address, creator);

    await mergeData(data.rows);

    return data;
  }

  async function getPendingFor(address: string) {
    const data = await getIssues({address, state: `pending`});

    await mergeData(data.rows);

    return data;
  }

  return {getIssue, getIssues, getPendingFor}
}
