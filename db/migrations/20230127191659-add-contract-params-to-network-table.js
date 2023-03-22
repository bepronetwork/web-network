'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const integerParam = {
      type: Sequelize.BIGINT
    };

    const floatParam = {
      type: Sequelize.FLOAT
    };

    await queryInterface.addColumn("networks", "councilAmount", {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn("networks", "disputableTime", integerParam);
    await queryInterface.addColumn("networks", "draftTime", integerParam);
    await queryInterface.addColumn("networks", "oracleExchangeRate", floatParam);
    await queryInterface.addColumn("networks", "mergeCreatorFeeShare", floatParam);
    await queryInterface.addColumn("networks", "percentageNeededForDispute", floatParam);
    await queryInterface.addColumn("networks", "cancelableTime", integerParam);
    await queryInterface.addColumn("networks", "proposerFeeShare", floatParam);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("networks", "councilAmount");
    await queryInterface.removeColumn("networks", "disputableTime");
    await queryInterface.removeColumn("networks", "draftTime");
    await queryInterface.removeColumn("networks", "oracleExchangeRate");
    await queryInterface.removeColumn("networks", "mergeCreatorFeeShare");
    await queryInterface.removeColumn("networks", "percentageNeededForDispute");
    await queryInterface.removeColumn("networks", "cancelableTime");
    await queryInterface.removeColumn("networks", "proposerFeeShare");
  }
};
