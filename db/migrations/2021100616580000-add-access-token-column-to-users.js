module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "accessToken", {
      type: Sequelize.STRING
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "accessToken");
  }
};
