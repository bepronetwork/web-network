'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'merge_proposals',
      'scMergeId'
    );
  },

  async down (queryInterface, Sequelize) {
  }
};
