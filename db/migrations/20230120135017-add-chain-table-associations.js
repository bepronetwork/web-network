'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn("networks", "chain_id", {
      type: Sequelize.INTEGER,
      unique: "network_chain_unique",
      references: {
        model: "chains",
        key: "chainId"
      }
    });

    await queryInterface.changeColumn("issues", "chain_id", {
      type: Sequelize.INTEGER,
      references: {
        model: "chains",
        key: "chainId"
      }
    });

    await queryInterface.changeColumn("tokens", "chain_id", {
      type: Sequelize.INTEGER,
      references: {
        model: "chains",
        key: "chainId"
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("networks", "networks_chain_id_fkey");
    await queryInterface.removeConstraint("issues", "issues_chain_id_fkey");
    await queryInterface.removeConstraint("tokens", "tokens_chain_id_fkey");
  }
};
