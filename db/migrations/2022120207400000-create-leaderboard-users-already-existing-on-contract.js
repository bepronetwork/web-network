/* eslint-disable no-prototype-builtins */
const { QueryTypes } = require("sequelize");

const { Settings } = require("../models/settings.model");
const { LeaderBoard } = require("../models/leaderboard.model");

const { Web3Connection, BountyToken, NetworkRegistry } = require("@taikai/dappkit");
require("dotenv").config();

const name = "create-leaderboard-users-already-existing-on-contract";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (process.env?.SKIP_MIGRATION_SEED_LEADERBOARD?.toLowerCase() === "true")
      return console.log("SKIPPING SEED LEADERBOARD STEP");

    const settings = await queryInterface.sequelize.query(
      "SELECT * FROM settings WHERE visibility = :public",
      {
        replacements: { public: "public" },
        model: Settings,
        mapToModel: true,
        type: QueryTypes.SELECT,
      }
    );

    if (!settings.length) return console.log(`${name} - Settings not found`);

    const networkRegistry = settings.find(
      ({ key }) => key === "networkRegistry"
    );

    if (!networkRegistry)
      return console.log(`${name} - Network registry not found`);

    console.log("Begin create and change users leaderboard");

    let usersUpdated = 0;

    const web3Connection = new Web3Connection({
      skipWindowAssignment: true,
      web3Host: process.env.NEXT_PUBLIC_WEB3_CONNECTION,
    });

    await web3Connection.start();

    const registry = new NetworkRegistry(web3Connection, networkRegistry.value);
    await registry.loadContract();

    const _bountyToken = new BountyToken(
      web3Connection,
      registry.bountyToken.contractAddress
    );
    await _bountyToken.loadContract();

    const blockNumber = await web3Connection.eth.getBlockNumber();

    const TransferEvents = await _bountyToken.getTransferEvents({
      fromBlock: process.env.BULK_CHAIN_START_BLOCK_MIGRATION_LEADERBOARD || 0,
      toBlock: blockNumber,
    });

    console.log('TransferEvent', TransferEvents.length)

    for (const transferEvent of TransferEvents) {
      const { to, tokenId } = transferEvent.returnValues;

      let result;

      const userLeaderboard = await queryInterface.sequelize.query(
        "SELECT * FROM leaderboard WHERE address = :address",
        {
          replacements: { address: to },
          type: QueryTypes.SELECT,
        }
      );

      const nftToken = await _bountyToken.getBountyToken(tokenId);
      const balance = await _bountyToken.balanceOf(to);

      if (userLeaderboard[0] && nftToken && balance) {
        const query = `UPDATE leaderboard SET "numberNfts" = $numberNfts WHERE id = $id`;

        result = await queryInterface.sequelize.query(query, {
          bind: {
            numberNfts: balance,
            id: userLeaderboard[0].id,
          },
        });
      } else if (!userLeaderboard[0] && nftToken && balance) {
        result = await queryInterface.insert(LeaderBoard, "leaderboard", {
          address: to,
          numberNfts: balance,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      usersUpdated += result ? 1 : 0;
    }

    console.log("Number of changes in leaderboard table", usersUpdated);
  },
};
