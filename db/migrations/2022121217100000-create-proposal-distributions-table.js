"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("proposal_distributions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      percentage: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      proposalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "merge_proposals",
          key: "id"
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
    await queryInterface.dropTable("proposal_distributions");
  }
};