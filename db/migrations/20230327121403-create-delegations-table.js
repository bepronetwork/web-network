'use strict';

const { Web3Connection, Network_v2 } = require("@taikai/dappkit");

const ChainModel = require("../models/chain.model");
const NetworkModel = require("../models/network.model");
const CuratorsModel = require("../models/curator-model");
const IssueModel = require("../models/issue.model");
const RepositoryModel = require("../models/repositories.model");
const MergeProposalModel = require("../models/mergeproposal");
const TokenModel = require("../models/tokens.model");
const DelegationModel = require("../models/delegation.model");
const DisputeModel = require("../models/dispute-model");

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

    [
      ChainModel,
      NetworkModel,
      CuratorsModel,
      IssueModel,
      RepositoryModel,
      MergeProposalModel,
      TokenModel,
      DelegationModel,
      DisputeModel
    ].forEach(model => model.init(queryInterface.sequelize));

    [
      ChainModel,
      NetworkModel,
      CuratorsModel
    ].forEach(model => model.associate(queryInterface.sequelize.models));

    const chains = await ChainModel.findAll({
      include: [
        {
          association: "networks",
          include: [
            { association: "curators" }
          ]
        }
      ]
    });

    if (!chains.length) return;

    try {
      for (const { chainId, chainRpc, networks } of chains) {
        const web3Connection = new Web3Connection({
          skipWindowAssignment: true,
          web3Host: chainRpc,
        });

        await web3Connection.start();

        for (const { networkAddress, curators } of networks) {
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
