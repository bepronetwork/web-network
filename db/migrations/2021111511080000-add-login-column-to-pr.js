const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("pull_requests", "githubLogin", {
      type: DataTypes.STRING
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("pull_requests", "githubLogin");
  }
};
