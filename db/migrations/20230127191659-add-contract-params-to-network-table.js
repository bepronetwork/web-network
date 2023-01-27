'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const parameter = {
      type: Sequelize.INTEGER,
      allowNull: true
    };

    await queryInterface.addColumn("networks", "councilAmount", {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("networks", "disputableTime", parameter);
    await queryInterface.addColumn("networks", "draftTime", parameter);
    await queryInterface.addColumn("networks", "oracleExchangeRate", parameter);
    await queryInterface.addColumn("networks", "mergeCreatorFeeShare", parameter);
    await queryInterface.addColumn("networks", "percentageNeededForDispute", parameter);
    await queryInterface.addColumn("networks", "cancelableTime", parameter);
    await queryInterface.addColumn("networks", "proposerFeeShare", parameter);
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
