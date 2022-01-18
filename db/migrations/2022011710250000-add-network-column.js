module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('issues', 'network_id', {
      type: Sequelize.INTEGER,
      references: {
        model: `networks`,
        key: `id`
      }
    })

    await queryInterface.addColumn('repositories', 'network_id', {
      type: Sequelize.INTEGER,
      references: {
        model: `networks`,
        key: `id`
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('issues', 'network_id')
    await queryInterface.removeColumn('repositories', 'network_id')
  }
}
