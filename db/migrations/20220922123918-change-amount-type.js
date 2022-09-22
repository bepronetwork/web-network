'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn("issues", "amount", {
      type: Sequelize.STRING
    });

    await queryInterface.changeColumn("issues", "fundingAmount", {
      type: Sequelize.STRING
    });

    await queryInterface.changeColumn("issues", "fundedAmount", {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn("issues", "amount", {
      type: Sequelize.INTEGER
    });

    await queryInterface.changeColumn("issues", "fundingAmount", {
      type: Sequelize.INTEGER
    });

    await queryInterface.changeColumn("issues", "fundedAmount", {
      type: Sequelize.INTEGER
    });
  },
};
