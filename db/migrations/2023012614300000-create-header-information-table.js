"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("header_information", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      bounties: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      TVL: {
        type: Sequelize.STRING
      },
      number_of_network: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_price_used: {
        type: Sequelize.JSON,
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
    await queryInterface.dropTable("header_information");
  }
};