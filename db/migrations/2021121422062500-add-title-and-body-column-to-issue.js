const { DataTypes, QueryTypes } = require('sequelize')
const { Issue } = require(`../models/issue.model`)
const Octokit = require('octokit').Octokit
require('dotenv').config()

module.exports = {
  up: async (queryInterface, Sequelize) => {
    Promise.all([
      queryInterface.addColumn('issues', 'title', { type: DataTypes.STRING }),
      queryInterface.addColumn('issues', 'body', { type: DataTypes.STRING })
    ]).then(async (values) => {
      const repositories = await queryInterface.sequelize.query('SELECT * FROM repositories', {
        type: QueryTypes.SELECT
      })

      const issues = await queryInterface.sequelize.query('SELECT * FROM issues', {
        model: Issue,
        mapToModel: true,
        type: QueryTypes.SELECT
      })

      const octokit = new Octokit({
        auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN
      })
      
      for (const issue of issues) {
        const repository = repositories.find(repo => repo.id === issue.repository_id)
        
        if (!repository) break
        
        const [owner, repo] = repository.githubPath.split('/')

        console.log(issue.githubId)
        
        const {
          data: { title, body }
        } = await octokit.rest.issues.get({
          owner,
          repo,
          issue_number: issue.githubId
        })
  
        console.log('title', title)
        console.log('body', body)

        issue.title = title
        issue.body = body

        issue.save()
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('issues', `title`)
    queryInterface.removeColumn('issues', `body`)
  }
}
