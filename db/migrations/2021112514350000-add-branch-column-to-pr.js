const { DataTypes } = require("sequelize");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .addColumn("pull_requests", "branch", { type: DataTypes.STRING })
      .then(() =>
        queryInterface.bulkUpdate("pull_requests",
          { branch: "master" },
          { branch: null }));
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("pull_requests", "branch");
  }
};
