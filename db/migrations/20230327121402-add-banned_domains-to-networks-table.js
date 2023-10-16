module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("networks", "banned_domains", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("networks", "banned_domains");
  },
};
