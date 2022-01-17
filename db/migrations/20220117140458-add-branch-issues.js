module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('issues', 'branch', {
      type: Sequelize.STRING
    });

  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('issues', `branch`);
  }
};
