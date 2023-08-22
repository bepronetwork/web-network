'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "email", {
      type: Sequelize.STRING,
      unique: true
    });

    await queryInterface.addColumn("users", "isEmailConfirmed", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn("users", "emailVerificationCode", {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn("users", "emailVerificationSentAt", {
      type: Sequelize.DATE
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "email");
    await queryInterface.removeColumn("users", "isEmailConfirmed");
    await queryInterface.removeColumn("users", "emailVerificationCode");
    await queryInterface.removeColumn("users", "emailVerificationSentAt");
  }
};
