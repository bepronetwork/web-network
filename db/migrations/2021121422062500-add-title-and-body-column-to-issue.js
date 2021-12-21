const { DataTypes, QueryTypes } = require('sequelize')
const { Issue } = require(`../models/issue.model`)
const Octokit = require('octokit').Octokit
require('dotenv').config()

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('issues', 'title', {
      type: DataTypes.STRING
    })

    await queryInterface.addColumn('issues', 'body', { type: DataTypes.STRING })

    const repositories = await queryInterface.sequelize.query(
      'SELECT * FROM repositories',
      {
        type: QueryTypes.SELECT
      }
    )

    const issues = await queryInterface.sequelize.query(
      'SELECT * FROM issues',
      {
        model: Issue,
        mapToModel: true,
        type: QueryTypes.SELECT
      }
    )

    const octokit = new Octokit({
      auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN
    })

    console.log('Begin fetching title and body with Octokit')
    console.log('Issues to update: ', issues.length)

    let issuesUpdated = 0

    for (const issue of issues) {
      const repository = repositories.find(
        (repo) => repo.id === issue.repository_id
      )

      if (!repository) break

      const [owner, repo] = repository.githubPath.split('/')

      const {
        data: { title, body }
      } = await octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issue.githubId
      })

      const [results, metadata] = await queryInterface.sequelize.query(
        'UPDATE issues SET title = $title, body = $body WHERE id = $id',
        {
          bind: {
            title,
            body,
            id: issue.id
          }
        }
      )

      console.log('.')

      issuesUpdated += metadata.rowCount
    }

    console.log('Issues updated: ', issuesUpdated)
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('issues', `title`)
    queryInterface.removeColumn('issues', `body`)
  }
}
