const {DataTypes} = require("sequelize");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('issues', 'body', {type: DataTypes.STRING,});

  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('issues', `body`);
  }
};