'use strict';

const { Web3Connection, Network_v2 } = require("@taikai/dappkit");

const CuratorsModel = require("../models/curator-model");
const NetworkModel = require("../models/network.model");

const { NEXT_PUBLIC_WEB3_CONNECTION: web3Rpc, NEXT_PUBLIC_NEEDS_CHAIN_ID: defaultChainId } = process.env;

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
      }
    });

    CuratorsModel.init(queryInterface.sequelize);
    NetworkModel.init(queryInterface.sequelize);

    CuratorsModel.associate(queryInterface.sequelize.models);

    const curators = await CuratorsModel.findAll({
      include: [
        { association: "network" }
      ],
      order: [["networkId", "ASC"]]
    });

    if (!curators.length) return;

    try {
      const web3Connection = new Web3Connection({
        skipWindowAssignment: true,
        web3Host: web3Rpc,
      });

      await web3Connection.start();

      let networkV2 = undefined;

      for (const curator of curators) {
        if (networkV2?.contractAddress !== curator.network.networkAddress) {
          networkV2 = new Network_v2(web3Connection, curator.network.networkAddress);

          await networkV2.loadContract();
        }

        const delegationOf = await networkV2.getDelegationsOf(curator.address);

        if (!delegationOf.length) continue;

        const delegations = delegationOf.map(({ from, to, amount }) => ({
          from,
          to,
          amount,
          networkId: curator.networkId,
          chainId: defaultChainId
        }));

        await queryInterface.bulkInsert("delegations", delegations);
      }
    } catch (error) {
      console.log("Failed to read previous delegations: ", error.toString());
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("delegations");
  }
};
