'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn("issues", "tokenId", "transactionalTokenId");

    await queryInterface.addColumn("issues", "rewardAmount", {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("issues", "rewardTokenId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "tokens",
        key: "id"
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn("issues", "transactionalTokenId", "tokenId");

    await queryInterface.removeColumn("issues", "rewardAmount");

    await queryInterface.removeColumn("issues", "rewardTokenId");
  }
};
