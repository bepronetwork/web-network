/* eslint-disable no-prototype-builtins */
const { QueryTypes } = require("sequelize");

const { ChainEvents } = require("../models/chain-events.model");

const {
  Web3Connection,
} = require("@taikai/dappkit");
require("dotenv").config();

const name = "add-transfer-events-to-chain-events-table";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transferEvents = await queryInterface.sequelize.query(
      "SELECT * FROM chain_events WHERE name = :name",
      {
        replacements: { name: "getTransferEvents" },
        model: ChainEvents,
        mapToModel: true,
        type: QueryTypes.SELECT,
      }
    );

    if (transferEvents[0])
      return console.log(
        `${name} - Transfer Events already exists in database`
      );
    else {
      const web3Connection = new Web3Connection({
        skipWindowAssignment: true,
        web3Host: process.env.NEXT_PUBLIC_WEB3_CONNECTION,
      });

      await web3Connection.start();

      const lastBlock = await web3Connection.eth.getBlockNumber();

      await queryInterface.insert(ChainEvents, "chain_events", {
        name: "getTransferEvents",
        lastBlock,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  },
};
