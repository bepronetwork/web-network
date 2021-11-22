module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('merge_proposals', { id: Sequelize.INTEGER });
     */

    queryInterface.changeColumn('issues', 'working', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: []
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('merge_proposals');
     */
    
  }
};
