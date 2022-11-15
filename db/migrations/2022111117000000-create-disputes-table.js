"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("disputes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      issueId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "issues",
          key: "id"
        }
      },
      address: {
        type: Sequelize.STRING,
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
      weight: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.dropTable("disputes");
  }
};