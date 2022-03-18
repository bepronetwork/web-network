const { RepositoriesModel } = require("../models/repositories.model");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface
      .createTable("repositories", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          unique: true
        },
        githubPath: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        }
      })
      .then(() => {
        queryInterface.insert(RepositoriesModel, "repositories", {
          githubPath: `${process.env.GITHUB_OWNER}/${process.env.REPO}`
        });
      });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("repositories");
  }
};
