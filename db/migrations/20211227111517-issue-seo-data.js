module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('issues', 'seoImage', {
      type: Sequelize.STRING
    });

  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('issues', `seoImage`);
  }
};
