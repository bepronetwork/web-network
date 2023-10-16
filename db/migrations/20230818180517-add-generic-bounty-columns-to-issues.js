'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("issues", "ipfsUrl", {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn("issues", "type", {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn("issues", "origin", {
      type: Sequelize.TEXT
    });

    await queryInterface.addColumn("issues", "userId", {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id"
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("issues", "ipfsUrl");
    await queryInterface.removeColumn("issues", "type");
    await queryInterface.removeColumn("issues", "origin");
    await queryInterface.removeColumn("issues", "userId");
  }
};
