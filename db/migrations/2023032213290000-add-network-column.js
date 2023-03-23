module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("network", "allowMerge", {type: Sequelize.BOOLEAN, defaultValue: true});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("network", "allowMerge");
  }
};
