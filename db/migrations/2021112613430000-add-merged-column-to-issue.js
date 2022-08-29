const { DataTypes } = require("sequelize");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("issues", "merged", { type: DataTypes.STRING });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("issues", "merged");
  }
};
