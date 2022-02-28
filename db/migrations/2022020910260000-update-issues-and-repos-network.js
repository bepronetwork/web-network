module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(`issues`, {network_id: 1}, {network_id: null})
    await queryInterface.bulkUpdate(`repositories`, {network_id: 1}, {network_id: null})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(`issues`, {network_id: null}, {network_id: 1})
    await queryInterface.bulkUpdate(`repositories`, {network_id: null}, {network_id: 1})
  }
}
