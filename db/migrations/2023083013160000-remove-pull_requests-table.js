"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("pull_requests");
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("pull_requests", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      githubId: {
        type: Sequelize.STRING,
      },
      issueId: {
        type: Sequelize.INTEGER,
        references: {
          model: "issues",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      githubLogin: {
        type: Sequelize.STRING,
      },
      userRepo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userBranch: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contractId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      reviewers: {
        type: Sequelize.ARRAY(Sequelize.DataTypes.STRING),
        defaultValue: [],
      },
      network_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "networks",
          key: "id",
        },
      },
    });
  },
};
