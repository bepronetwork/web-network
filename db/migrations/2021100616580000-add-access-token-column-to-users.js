const models = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('users', 'accessToken', {type: Sequelize.STRING,})
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('users', 'accessToken');
  }
};
