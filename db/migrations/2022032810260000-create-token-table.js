"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tokens", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tokens");
  }
};
