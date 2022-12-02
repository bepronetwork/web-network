/* eslint-disable no-prototype-builtins */
const { QueryTypes } = require("sequelize");

const { Network } = require("../models/network.model");
const { Curators } = require("../models/curator-model");

const { Web3Connection, Network_v2 } = require("@taikai/dappkit");
const BigNumber = require("bignumber.js");
require("dotenv").config();

async function handleCurators(
  address,
  totalVotes,
  councilAmount,
  networkId,
  issues,
  queryInterface
) {
  const isCurator = BigNumber(totalVotes).gte(councilAmount);

  const curatorInDb = await queryInterface.sequelize.query(
    'SELECT * FROM curators WHERE address = :address AND "networkId" = :networkId',
    {
      replacements: { address: address, networkId: networkId },
      type: QueryTypes.SELECT,
    }
  );

  const proposals = await queryInterface.sequelize.query(
    "SELECT * FROM merge_proposals WHERE creator = ?",
    {
      replacements: [address],
      type: QueryTypes.SELECT,
    }
  );

  const closedsBounty = proposals
    .filter((p) => p.creator === address)
    .map((proposal) => {
      const closed = issues.filter((issue) => {
        if (
          Number(issue.merged) === proposal.contractId &&
          issue.id === proposal.issueId
        )
          return issue;
      });
      if (closed.length > 0) return proposal;
    })
    .filter((e) => e);

  if (curatorInDb[0]) {
    const query = `UPDATE curators SET 
    "tokensLocked" = $tokensLocked, 
    "isCurrentlyCurator" = $isCurrentlyCurator,
    "acceptedProposals" = $acceptedProposals
    WHERE id = $id`;

    return await queryInterface.sequelize.query(query, {
      bind: {
        tokensLocked: totalVotes,
        isCurrentlyCurator: isCurator,
        acceptedProposals: closedsBounty.length,
        id: curatorInDb[0].id,
      },
    });
  } else if (!curatorInDb[0] && isCurator) {
    return await queryInterface.insert(Curators, "curators", {
      address: address,
      networkId,
      isCurrentlyCurator: true,
      tokensLocked: totalVotes,
      acceptedProposals: closedsBounty.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return null;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (process.env?.SKIP_MIGRATION_SEED_CURATORS?.toLowerCase() === "true")
      return console.log("SKIPPING SEED CURATORS STEP");

    const networks = await queryInterface.sequelize.query(
      "SELECT * FROM networks",
      {
        model: Network,
        mapToModel: true,
        type: QueryTypes.SELECT,
      }
    );

    if (!networks.length) return;

    console.log("Begin create and change curators");
    console.log("Networks to verify: ", networks.length);

    let curatorsUpdated = 0;

    for (const network of networks) {
      if (!network.networkAddress) return;

      const web3Connection = new Web3Connection({
        skipWindowAssignment: true,
        web3Host: process.env.NEXT_PUBLIC_WEB3_CONNECTION,
      });

      await web3Connection.start();

      const currentNetwork = new Network_v2(
        web3Connection,
        network.networkAddress
      );

      await currentNetwork.loadContract();

      await currentNetwork.start();

      const councilAmount = await currentNetwork.councilAmount();

      const blockNumber =
        await currentNetwork._contract.web3.eth.getBlockNumber();

      const OracleChangedEvents = await currentNetwork.getOraclesChangedEvents({
        fromBlock: process.env.BULK_CHAIN_START_BLOCK_MIGRATION_CURATORS || 0,
        toBlock: blockNumber,
      });

      const issues = await queryInterface.sequelize.query(
        "SELECT * FROM issues WHERE network_id = ?",
        {
          replacements: [network.id],
          type: QueryTypes.SELECT,
        }
      );

      for (const changedEvent of OracleChangedEvents) {
        const { actor } = changedEvent.returnValues;
        const actorTotalVotes = await currentNetwork.getOraclesOf(actor);

        const resultChangedEvent = await handleCurators(
          actor,
          actorTotalVotes,
          councilAmount,
          network.id,
          issues,
          queryInterface
        );

        curatorsUpdated += resultChangedEvent ? 1 : 0;
      }

      const OracleTransferEvents =
        await currentNetwork.getOraclesTransferEvents({
          fromBlock: process.env.BULK_CHAIN_START_BLOCK_MIGRATION_CURATORS || 0,
          toBlock: blockNumber,
        });

      for (const changedEvent of OracleTransferEvents) {
        const { from, to } = changedEvent.returnValues;

        [from, to].map((address) =>
          currentNetwork.getOraclesOf(address).then(async (votes) => {
            const resultChangedEvent = await handleCurators(
              address,
              votes,
              councilAmount,
              network.id,
              issues,
              queryInterface
            );

            curatorsUpdated += resultChangedEvent ? 1 : 0;
          })
        );
      }
    }
    console.log("Number of changes in curators table", curatorsUpdated);
  },
};
