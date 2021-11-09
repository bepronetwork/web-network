const models = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('users', 'address', {type: Sequelize.STRING, unique: true,})
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('users', 'address', {type: Sequelize.STRING,});
  }
};
