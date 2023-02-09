'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn("issues", "tokenId", "transactionalTokenId");

    await queryInterface.removeConstraint("issues", "issues_tokenId_fkey");

    await queryInterface.addConstraint("issues", {
      type: "foreign key",
      fields: ["transactionalTokenId"],
      name: "issues_transactionalTokenId_fkey",
      references: {
        table: "tokens",
        field: "id"
      }
    });

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

    await queryInterface.removeConstraint("issues", "issues_transactionalTokenId_fkey");

    await queryInterface.addConstraint("issues", {
      type: "foreign key",
      fields: ["tokenId"],
      name: "issues_tokenId_fkey",
      references: {
        table: "tokens",
        field: "id"
      }
    });

    await queryInterface.removeColumn("issues", "rewardAmount");

    await queryInterface.removeColumn("issues", "rewardTokenId");
  }
};
