'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("networks", "networks_name_key");
    
    await queryInterface.changeColumn("networks", "name", {
      type: Sequelize.STRING,
      unique: "network_chain_unique"
    });

    await queryInterface.changeColumn("networks", "chain_id", {
      type: Sequelize.INTEGER,
      unique: "network_chain_unique"
    });

    await queryInterface.addConstraint("networks", {
      type: "unique",
      fields: ["name", "chain_id"],
      name: "network_chain_unique"
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("networks", "network_chain_unique")
      .catch(error => console.log("Contrainst already removed", error?.name));

    await queryInterface.addConstraint("networks", {
      type: "unique",
      fields: ["name"],
      name: "networks_name_key"
    });
  }
};
