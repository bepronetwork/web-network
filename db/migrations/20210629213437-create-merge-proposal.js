'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('merge_proposals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      scMergeId: {
        type: Sequelize.STRING,
      },
      issueId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'issues',
          key: 'id'
        }
      },
      pullRequestId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'pull_requests',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('merge_proposals');
  }
};