module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('merge_proposals', { id: Sequelize.INTEGER });
     */

    queryInterface.addColumn('pull_requests', 'reviewers', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: []
    }).then(() => queryInterface.bulkUpdate(`pull_requests`, {reviewers: []}, {reviewers: null}));
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('pull_requests', `reviewers`);  
  }
};
