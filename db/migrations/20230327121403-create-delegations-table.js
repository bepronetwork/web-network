'use strict';

const { Web3Connection, Network_v2 } = require("@taikai/dappkit");
const { getAllFromTable } = require("../../helpers/db/rawQueries");

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("delegations", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      from: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "0x0000000000000000000000000000000000000000"
      },
      to: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "0x0000000000000000000000000000000000000000"
      },
      amount: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "0"
      },
      contractId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      networkId: {
        type: Sequelize.INTEGER,
        references: {
          model: "networks",
          key: "id"
        }
      },
      chainId: {
        type: Sequelize.INTEGER,
        references: {
          model: "chains",
          key: "chainId"
        }
      },
      curatorId: {
        type: Sequelize.INTEGER,
        references: {
          model: "curators",
          key: "id"
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: new Date()
      }
    });

    const chains = await getAllFromTable(queryInterface, "chains");
    
    if (!chains.length) return;

    const allNetworks = await getAllFromTable(queryInterface, "networks");
    const allCurators = await getAllFromTable(queryInterface, "curators");

    try {
      for (const { chainId, chainRpc } of chains) {
        const web3Connection = new Web3Connection({
          skipWindowAssignment: true,
          web3Host: chainRpc,
        });

        await web3Connection.start();

        const networks = allNetworks.filter(n => n.chain_id === chainId);
        if (!networks.length) continue;

        for (const { id, networkAddress } of networks) {
          const curators = allCurators.filter(c => c.networkId === id);
          if (!curators.length) continue;

          const networkV2 = new Network_v2(web3Connection, networkAddress);

          await networkV2.loadContract();

          for (const curator of curators) {
            const delegationOf = await networkV2.getDelegationsOf(curator.address);

            if (!delegationOf.length) continue;

            const delegations = delegationOf.map(({ id, from, to, amount }) => ({
              from,
              to,
              amount,
              contractId: id,
              networkId: curator.networkId,
              chainId: chainId,
              curatorId: curator.id,
            }));

            await queryInterface.bulkInsert("delegations", delegations);
          }
        }
      }
    } catch (error) {
      console.log("Failed to read previous delegations: ", error.toString());
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("delegations");
  }
};
