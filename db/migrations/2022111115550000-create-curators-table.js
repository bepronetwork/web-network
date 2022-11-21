"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("curators", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      acceptedProposals: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      disputedProposals: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      tokensLocked: {
        type: Sequelize.STRING,
        allowNull: true
      },
      networkId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "networks",
          key: "id"
        }
      },
      isCurrentlyCurator: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable("curators");
  }
};