module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("issues", "visible", {type: Sequelize.BOOLEAN, defaultValue: true});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("issues", "visible");
  }
};
