'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("leaderboard", "ownedBountiesOpened", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn("leaderboard", "ownedBountiesClosed", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn("leaderboard", "ownedBountiesCanceled", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn("leaderboard", "ownedProposalCreated", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn("leaderboard", "ownedProposalAccepted", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn("leaderboard", "ownedProposalRejected", {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("leaderboard", "ownedBountiesOpened");

    await queryInterface.removeColumn("leaderboard", "ownedBountiesClosed");

    await queryInterface.removeColumn("leaderboard", "ownedBountiesCanceled");

    await queryInterface.removeColumn("leaderboard", "ownedProposalCreated");

    await queryInterface.removeColumn("leaderboard", "ownedProposalAccepted");

    await queryInterface.removeColumn("leaderboard", "ownedProposalRejected");
  }
};
