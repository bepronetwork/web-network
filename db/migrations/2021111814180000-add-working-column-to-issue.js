module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('merge_proposals', { id: Sequelize.INTEGER });
     */

    queryInterface
      .addColumn("issues", "working", {
        type: Sequelize.ARRAY(Sequelize.STRING)
      })
      .then(() => {
        queryInterface.bulkUpdate("issues", { working: [] }, { working: null });
      });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('merge_proposals');
     */
    queryInterface.removeColumn("issues", "working");
  }
};
