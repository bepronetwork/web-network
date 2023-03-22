'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("repositories", "repositories_githubPath_key");

    await queryInterface.changeColumn("repositories", "githubPath", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: "repositories_networks_unique"
    });

    await queryInterface.changeColumn("repositories", "network_id", {
      type: Sequelize.INTEGER,
      unique: "repositories_networks_unique"
    });

    await queryInterface.addConstraint("repositories", {
      fields: ["githubPath", "network_id"],
      type: "unique",
      name: "repositories_networks_unique"
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("repositories", "repositories_networks_unique");

    await queryInterface.changeColumn("repositories", "githubPath", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });

    await queryInterface.changeColumn("repositories", "network_id", {
      type: Sequelize.INTEGER,
      unique: false
    });
  }
};
