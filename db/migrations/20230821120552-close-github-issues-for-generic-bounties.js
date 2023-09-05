'use strict';

const Octokit = require("octokit").Octokit;

const { getAllFromTable } = require("../../helpers/db/rawQueries");
const getConfig = require('../../next.config.js');

const { serverRuntimeConfig } = getConfig();

async function updateIssuesStateOnGithub(issues, repositories, state) {
  let repository = null;

  const findRepository = id => repositories.find(repo => repo.id === id);

  const octokit = new Octokit({
    auth: serverRuntimeConfig.github.token,
  });

  for (const issue of issues) {
    if (issue.repository_id !== repository?.id)
      repository = findRepository(issue.repository_id);

    const [owner, repo] = repository?.githubPath?.split("/");

    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issue.githubId,
      state: state
    });
  }
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const issues = await getAllFromTable(queryInterface, "issues");
    const repositories = await getAllFromTable(queryInterface, "repositories");

    const issuesToUpdate = issues.filter(({ ipfsUrl, state }) => !!ipfsUrl && !["closed"].includes(state));

    await updateIssuesStateOnGithub(issuesToUpdate, repositories, "closed");
  },

  async down (queryInterface, Sequelize) {
    const issues = await getAllFromTable(queryInterface, "issues");
    const repositories = await getAllFromTable(queryInterface, "repositories");

    const issuesToUpdate = issues.filter(({ ipfsUrl, state, issueId }) => 
      !!ipfsUrl && 
      !["closed", "canceled"].includes(state) &&
      !!issueId);

    await updateIssuesStateOnGithub(issuesToUpdate, repositories, "open");
  }
};
