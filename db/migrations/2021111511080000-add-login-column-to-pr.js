const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn("pull_requests", "githubLogin", {
      type: DataTypes.STRING
    });
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn("pull_requests", "githubLogin");
  }
};
