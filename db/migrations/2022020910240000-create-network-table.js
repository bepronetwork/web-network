'use strict'

const { Network } = require(`../models/network.model`)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
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
        description: {
          type: Sequelize.STRING,
          allowNull: false
        },
        colors: {
          type: Sequelize.JSON,
          allowNull: true
        },
        networkAddress: {
          type: Sequelize.STRING,
          allowNull: true
        },
        logoIcon: {
          type: Sequelize.STRING,
          allowNull: true
        },
        fullLogo: {
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
      
      await queryInterface.insert(Network, 'networks', {
        creatorAddress:
          `${process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS}`.toLowerCase(),
        name: `${process.env.NEXT_PUBLIC_BEPRO_NETWORK_NAME}`,
        description: `${process.env.NEXT_PUBLIC_BEPRO_NETWORK_NAME}`,
        colors: null,
        networkAddress: `${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`,
        logoIcon: 'QmQs5F8eyQGen6PPgXTG9Kg5gqCPMMBEaz8jfwSw386Vmh',
        fullLogo: 'QmP3BahDdkjjiBmHTLPDbEoH4dgRuCd95rGBtH4DhQQwx3',
        createdAt: new Date(),
        updatedAt: new Date()
      })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('networks')
  }
}
