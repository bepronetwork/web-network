module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("networks", "allowMerge", {type: Sequelize.BOOLEAN, defaultValue: true});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("networks", "allowMerge");
  }
};
