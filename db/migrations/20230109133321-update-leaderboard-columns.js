'use strict';

const { updateLeaderboardBounties, updateLeaderboardProposals } = require("../../scripts/leaderboard");

module.exports = {
  async up (queryInterface, Sequelize) {
    await updateLeaderboardBounties();
    await updateLeaderboardBounties("canceled");
    await updateLeaderboardBounties("closed");

    await updateLeaderboardProposals();
    await updateLeaderboardProposals("accepted");
    await updateLeaderboardProposals("rejected");
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
