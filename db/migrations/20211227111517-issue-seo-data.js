module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("issues", "seoImage", {
      type: Sequelize.STRING
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("issues", "seoImage");
  }
};
