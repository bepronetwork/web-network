const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('networks', 'isClosed', {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    })

    await queryInterface.bulkUpdate(
      'networks',
      { isClosed: false },
      { isClosed: null }
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('networks', `isClosed`)
  }
}
