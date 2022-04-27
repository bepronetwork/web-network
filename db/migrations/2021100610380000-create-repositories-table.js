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
        if(process.env.NEXT_GH_OWNER && process.env.NEXT_GH_REPO)
          queryInterface.insert(RepositoriesModel, "repositories", {
            githubPath: `${process.env.NEXT_GH_OWNER}/${process.env.NEXT_GH_REPO}`
          });
      });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("repositories");
  }
};
