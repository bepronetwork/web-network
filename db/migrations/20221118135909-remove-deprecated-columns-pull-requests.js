'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'pull_requests',
      'branch'
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface
    .addColumn("pull_requests", "branch", { type: DataTypes.STRING })
    .then(() =>
      queryInterface.bulkUpdate("pull_requests",
        { branch: "master" },
        { branch: null }));
  }
};