module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("pull_requests", "network_id", {
      type: Sequelize.INTEGER,
      references: {
        model: "networks",
        key: "id"
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("pull_requests", "network_id");
  }
};
