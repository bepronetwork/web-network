"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("comments", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      comment: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false
      },
      hidden: {
        type: Sequelize.BOOLEAN, 
        defaultValue: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      issueId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "issues",
          key: "id"
        }
      },
      proposalId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "merge_proposals",
          key: "id"
        }
      },
      deliverableId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "pull_requests",
          key: "id"
        }
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        }
      },
      userAddress: {
        type: Sequelize.STRING,
        allowNull: false
      },
      replyId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "comments",
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
    await queryInterface.dropTable("comments");
  }
};