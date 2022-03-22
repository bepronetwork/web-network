import { useRepos } from "contexts/repos";

import { IssueData, pullRequest } from "interfaces/issue-data";
import { PaginatedData } from "interfaces/paginated-data";

import useApi from "x-hooks/use-api";
import useOctokit from "x-hooks/use-octokit";

interface MergeProps {
  repoId: string;
  githubId: string;
  path: string;
}

const OctoData = {};

export default function useMergeData() {
  const { loadRepos, repoList } = useRepos();
  const db = useApi();
  const octokit = useOctokit();

  async function mergeData(data: IssueData[]) {
    const list = repoList.length ? repoList : await loadRepos();

    for (let i = 0; i < data.length; i++) {
      const issue = data[i];
      if (OctoData[`${issue.githubId}/${issue.repository_id}`])
        Object.assign(issue,
                      OctoData[`${issue.githubId}/${issue.repository_id}`]);
      else {
        const { githubPath: repo } = list.find(({ id }) => id === issue.repository_id);
        const {
          data: { title, body, comments }
        } = await octokit.getIssue(+issue.githubId, repo);
        OctoData[`${issue.githubId}/${issue.repository_id}`] = {
          title,
          body,
          repo,
          numberOfComments: comments
        };
        Object.assign(issue, { title, body, repo, numberOfComments: comments });
      }
    }
  }

  async function getIssue(repoId: string,
                          githubId: string,
                          path: string,
                          networkName = "bepro"): Promise<IssueData> {
    const apiData = await db.getIssue(repoId, githubId, networkName);

    if (OctoData[`${apiData.githubId}/${apiData.repository_id}`])
      Object.assign(apiData,
                    OctoData[`${apiData.githubId}/${apiData.repository_id}`]);

    const {
      data: { title, body }
    } = await octokit.getIssue(+githubId, path);
    OctoData[`${apiData.githubId}/${apiData.repository_id}`] = {
      title,
      body,
      repo: path
    };

    return { ...apiData, title, body, repo: path };
  }

  async function getIssues({
    page = "1",
    repoId = "",
    time = "",
    state = "",
    sortBy = "updatedAt",
    order = "DESC",
    address = "",
    creator = "",
    networkName = "bepro"
  }) {
    const data = await db.getIssues(page,
                                    repoId,
                                    time,
                                    state,
                                    sortBy,
                                    order,
                                    address,
                                    creator,
                                    networkName);

    await mergeData(data.rows);

    return data;
  }

  async function getPendingFor(address: string, networkName = "bepro") {
    const data = await getIssues({ address, state: "pending", networkName });

    await mergeData(data.rows);

    return data;
  }

  async function getIssuesOfUserPullRequests(page,
                                             githubLogin: string,
                                             networkName = "bepro") {
    const pullRequestsWithIssueData = (await db.getUserPullRequests(page,
                                                                    githubLogin,
                                                                    networkName)) as PaginatedData<pullRequest>;
    const issues = pullRequestsWithIssueData.rows.map((pullRequest) => pullRequest.issue);

    await mergeData(issues);

    return pullRequestsWithIssueData;
  }

  async function getMergedDataFromPullRequests(repo, pullRequests) {
    const mergedPRs = [];

    for (const pr of pullRequests) {
      const key = `${repo}/${pr.issueId}/${pr.githubId}`;

      if (!OctoData[key]) {
        try {
          const { data: comments } = await octokit.getPullRequestComments(pr.githubId,
                                                                          repo);
          const { data: pullRequest } = await octokit.getPullRequest(pr.githubId,
                                                                     repo);

          OctoData[key] = {
            comments: comments,
            state: pullRequest.state,
            merged: pullRequest.merged,
            isMergeable: pullRequest.mergeable
          };
        } catch (error) {
          OctoData[key] = { comments: [], state: "" };
        }
      }

      mergedPRs.push(Object.assign(pr, OctoData[key]));
    }

    return mergedPRs;
  }

  return {
    getIssue,
    getIssues,
    getPendingFor,
    getIssuesOfUserPullRequests,
    getMergedDataFromPullRequests
  };
}
