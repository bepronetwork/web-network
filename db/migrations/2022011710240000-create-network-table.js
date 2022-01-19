'use strict'

const { Network } = require(`../models/network.model`)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface
      .createTable('networks', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        creatorAddress: {
          type: Sequelize.STRING,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false
        },
        colors: {
          type: Sequelize.JSON,
          allowNull: true
        },
        network_id: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        logo: {
          type: Sequelize.STRING,
          allowNull: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      })
      .then(() => {
        queryInterface.insert(Network, 'networks', {
          creatorAddress:
            `${process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS}`.toLowerCase(),
          name: 'bepro',
          colors: {
            primary: '#4250E4',
            secondary: '#FD8B2A',
            gray: '#C4C7D3',
            background: '#434758',
            shadow: '#20222B',
            success: '#35E0AD',
            fail: '#EB5757',
            warning: '#EE9240'
          },
          network_id: null,
          logo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('networks')
  }
}
