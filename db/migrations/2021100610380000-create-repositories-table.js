const { RepositoriesModel } = require("../models/repositories.model");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable("repositories", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          unique: true
        },
        githubPath: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        }
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("repositories");
  }
};
