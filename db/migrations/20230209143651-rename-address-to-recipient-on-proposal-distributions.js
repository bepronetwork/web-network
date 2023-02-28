'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn("proposal_distributions", "address", "recipient");
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn("proposal_distributions", "recipient", "address");
  }
};
