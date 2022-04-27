"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("network_tokens", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      networkId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "networks",
          key: "id"
        }
      },
      tokenId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tokens",
          key: "id"
        }
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("network_tokens");
  }
};
