'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('tokens', 'address', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
      });
    await queryInterface.removeConstraint('tokens', 'tokens_address_key')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('tokens', 'address', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      });
  }
};