module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("merge_proposals", "network_id", {
      type: Sequelize.INTEGER,
      references: {
        model: "networks",
        key: "id"
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("merge_proposals", "network_id");
  }
};
