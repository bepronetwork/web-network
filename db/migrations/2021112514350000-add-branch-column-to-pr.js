const {DataTypes} = require("sequelize");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('pull_requests', 'branch', {type: DataTypes.STRING,})
      .then(() => queryInterface.bulkUpdate(`pull_requests`, {branch: `master`}, {branch: null}));

  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('pull_requests', `branch`);
  }
};
