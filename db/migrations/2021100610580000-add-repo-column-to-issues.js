module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('merge_proposals', { id: Sequelize.INTEGER });
     */

    await queryInterface
      .addColumn("issues", "repository_id", {
        type: Sequelize.INTEGER,
        references: {
          model: "repositories",
          key: "id"
        }
      })
      .then(() => {
        queryInterface.bulkUpdate("issues",
          { repository_id: 1 },
          { repository_id: null });
      });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('merge_proposals');
     */
    await queryInterface.removeColumn("issues", "repository_id");
  }
};
