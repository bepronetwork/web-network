"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("deliverables", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      deliverableUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ipfsLink: {
        type: Sequelize.STRING,
        allowNull: false
      },
      title: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false
      },
      canceled: {
        type: Sequelize.BOOLEAN, 
        defaultValue: false
      },
      markedReadyForReview: {
        type: Sequelize.BOOLEAN, 
        defaultValue: false
      },
      accepted: {
        type: Sequelize.BOOLEAN, 
        defaultValue: false
      },
      issueId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "issues",
          key: "id"
        }
      },
      bountyId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      prContractId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
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
    await queryInterface.dropTable("deliverables");
  }
};