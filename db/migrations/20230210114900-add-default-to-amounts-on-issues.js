'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn("issues", "fundingAmount", {
      type: Sequelize.STRING,
      defaultValue: "0"
    });

    await queryInterface.changeColumn("issues", "fundedAmount", {
      type: Sequelize.STRING,
      defaultValue: "0"
    });

    await queryInterface.changeColumn("issues", "rewardAmount", {
      type: Sequelize.STRING,
      defaultValue: "0"
    });

    await queryInterface.bulkUpdate("issues", {
      fundingAmount: "0"
    }, {
      fundingAmount: null
    });

    await queryInterface.bulkUpdate("issues", {
      fundedAmount: "0"
    }, {
      fundedAmount: null
    });

    await queryInterface.bulkUpdate("issues", {
      rewardAmount: "0"
    }, {
      rewardAmount: null
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn("issues", "fundingAmount", {
      type: Sequelize.STRING,
      defaultValue: null
    });

    await queryInterface.changeColumn("issues", "fundedAmount", {
      type: Sequelize.STRING,
      defaultValue: null
    });

    await queryInterface.changeColumn("issues", "rewardAmount", {
      type: Sequelize.STRING,
      defaultValue: null
    });
  }
};
