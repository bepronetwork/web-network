const { QueryTypes } = require('sequelize')
const { Issue } = require(`../models/issue.model`)
require('dotenv').config()

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('issues', 'branch', {
      type: Sequelize.STRING
    }).then(async ()=>{
      const issues = await queryInterface.sequelize.query(
        'SELECT * FROM issues',
        {
          model: Issue,
          mapToModel: true,
          type: QueryTypes.SELECT
        }
      )
      if (!issues.length) return
      
      let issuesUpdated = 0

      for (const issue of issues) {
  
        const [results, metadata] = await queryInterface.sequelize.query(
          'UPDATE issues SET branch = $branch WHERE id = $id',
          {
            bind: {
              branch: process.env.NEXT_GITHUB_MAINBRANCH || 'master',
              id: issue.id
            }
          }
        )
  
        console.log('.')
  
        issuesUpdated += metadata.rowCount
      }
    })

  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('issues', `branch`);
  }
};
