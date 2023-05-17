'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn("leaderboard", "numberNfts", {
        type: Sequelize.INTEGER,
        defaultValue: 0
    });

    await queryInterface.sequelize.query(`UPDATE leaderboard SET "numberNfts" = 0 WHERE "numberNfts" IS NULL`);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`UPDATE leaderboard SET "numberNfts" = NULL WHERE "numberNfts" = 0`);

    await queryInterface.changeColumn("leaderboard", "numberNfts", {
        type: Sequelize.INTEGER,
        defaultValue: null
    });
  }
};
