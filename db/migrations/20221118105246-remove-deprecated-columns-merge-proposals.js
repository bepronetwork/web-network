'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'merge_proposals',
      'scMergeId'
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'merge_proposals',
      'scMergeId',
      {
        type: Sequelize.STRING
      }
    );
  }
};
