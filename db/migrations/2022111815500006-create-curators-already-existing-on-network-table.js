/* eslint-disable no-prototype-builtins */
const { QueryTypes } = require("sequelize");

const { Network } = require("../models/network.model");
const { Curators } = require("../models/curator-model");

const {
  Web3Connection,
  Network_v2,
} = require("@taikai/dappkit");
const BigNumber = require("bignumber.js");
require("dotenv").config();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const networks = await queryInterface.sequelize.query(
      "SELECT * FROM networks",
      {
        model: Network,
        mapToModel: true,
        type: QueryTypes.SELECT,
      }
    );

    if (!networks.length) return;

    console.log("Begin create curators");
    console.log("Networks to verify: ", networks.length);

    let curatorsUpdated = 0;

    for (const network of networks) {
      if(!network.networkAddress) return;

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

      const curators = await queryInterface.sequelize.query(
        "SELECT * FROM curators",
        {
          type: QueryTypes.SELECT,
        }
      );

      const issues = await queryInterface.sequelize.query(
        "SELECT * FROM issues WHERE network_id = ?",
        {
          replacements: [network.id],
          type: QueryTypes.SELECT,
        }
      );

      if (network.councilMembers !== null) {
        for (const address of network?.councilMembers) {
          const curatorInDb = curators.find(
            (c) => c.address === address && c.networkId === network.id
          );

          if (!curatorInDb) {
            const actorTotalVotes = await currentNetwork.getOraclesOf(address);
            const isCurator = BigNumber(actorTotalVotes).gte(councilAmount);

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
                const closed = issues.filter(
                  (issue) =>
                    issue.merged === proposal.scMergeId &&
                    issue.id === proposal.issueId
                );
                if (closed.length > 0) return proposal;
              })
              .filter((e) => e);

            if (isCurator) {
              const created = await queryInterface.insert(
                Curators,
                "curators",
                {
                  address: address,
                  networkId: network.id,
                  isCurrentlyCurator: true,
                  tokensLocked: actorTotalVotes,
                  acceptedProposals: closedsBounty.length,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }
              );

              if (created) curatorsUpdated += 1;
            }
          }
        }
      }
    }
 
   console.log("Curators created: ", curatorsUpdated);
  }
};
