/* eslint-disable no-prototype-builtins */
const { QueryTypes } = require("sequelize");

const { Network } = require("../models/network.model");
const { MergeProposal } = require("../models/mergeproposal");
const {
  ProposalDistributions,
} = require("../models/proposal-distributions.model");

const { Web3Connection, Network_v2 } = require("@taikai/dappkit");
const BigNumber = require("bignumber.js");
require("dotenv").config();

async function validateProposal(
  bounty,
  prId,
  proposalId,
  networkId,
  queryInterface
) {
  const dbBounty = await queryInterface.sequelize.query(
    'SELECT * FROM issues WHERE "contractId" = :contractId AND "network_id" = :networkId AND "issueId" = :issueId',
    {
      replacements: { contractId: bounty.id, networkId, issueId: bounty.cid },
      type: QueryTypes.SELECT,
    }
  );

  if (!dbBounty[0]) console.log("Database Bounty not found");

  const pullRequest = bounty.pullRequests.find((pr) => pr.id === +prId);

  const dbPullRequest = await queryInterface.sequelize.query(
    'SELECT * FROM pull_requests WHERE "issueId" = :issueId AND "githubId" = :githubId AND "network_id" = :networkId AND "contractId" = :contractId',
    {
      replacements: {
        issueId: dbBounty[0].id,
        githubId: pullRequest.cid.toString(),
        networkId,
        contractId: pullRequest.id,
      },
      type: QueryTypes.SELECT,
    }
  );

  if (!dbPullRequest[0])
    console.log(
      `Could not find pullRequest issueId:${dbBounty[0].id} github:${pullRequest.cid} in database for network ${networkId}`
    );

  const proposal = bounty.proposals.find(
    (proposal) => proposal.id === +proposalId
  );

  if (!proposal) return console.log("Could not find proposal for:", proposalId);

  const dbProposal = await queryInterface.sequelize.query(
    'SELECT * FROM merge_proposals WHERE "contractId" = :contractId AND "network_id" = :networkId AND "issueId" = :issueId',
    {
      replacements: {
        contractId: proposal.id,
        networkId,
        issueId: dbBounty[0].id,
      },
      type: QueryTypes.SELECT,
    }
  );

  return {
    proposal,
    dbBounty: dbBounty[0],
    dbPullRequest: dbPullRequest[0],
    dbProposal: dbProposal[0],
  };
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (process.env?.SKIP_MIGRATION_SEED_PROPOSAL?.toLowerCase() === "true")
      return console.log("SKIPPING SEED PROPOSAL STEP");

    const sleep = (ms = 200) => new Promise((r) => setTimeout(r, ms));

    const networks = await queryInterface.sequelize.query(
      "SELECT * FROM networks",
      {
        model: Network,
        mapToModel: true,
        type: QueryTypes.SELECT,
      }
    );

    if (!networks.length) return;

    console.log("Begin create and change proposal");
    console.log("Networks to verify: ", networks.length);

    let proposalsUpdated = 0;

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

      const blockNumber =
        await currentNetwork._contract.web3.eth.getBlockNumber();

      const paginateRequest = async (pool = [], name, fn) => {
        const startBlock = +(process.env.MIGRATION_START_BLOCK || 0);
        const endBlock = blockNumber;
        const perRequest = +(process.env.EVENTS_PER_REQUEST || 1500);
        const requests = Math.ceil((endBlock - startBlock) / perRequest);

        let toBlock = 0;

        console.log(
          `Fetching ${name} total of ${requests}, from: ${startBlock} to ${endBlock}`
        );
        for (
          let fromBlock = startBlock;
          fromBlock < endBlock;
          fromBlock += perRequest
        ) {
          toBlock =
            fromBlock + perRequest > endBlock
              ? endBlock
              : fromBlock + perRequest;

          console.log(
            `${name} fetch from ${fromBlock} to ${toBlock} (missing ${Math.ceil(
              (endBlock - toBlock) / perRequest
            )})`
          );

          let result = null;

          if (name === "getBountyProposalCreatedEvents")
            result = await currentNetwork.getBountyProposalCreatedEvents({
              fromBlock,
              toBlock,
            });
          else if (name === "getBountyProposalDisputedEvents")
            result = await currentNetwork.getBountyProposalDisputedEvents({
              fromBlock,
              toBlock,
            });
          else
            result = await currentNetwork.getBountyProposalRefusedEvents({
              fromBlock,
              toBlock,
            });

          pool.push(...result);

          await sleep();
        }
      };

      const BountyProposalCreatedEvents = [];
      const BountyProposalDisputedEvents = [];
      const BountyProposalRefusedEvents = [];

      await paginateRequest(
        BountyProposalCreatedEvents,
        `getBountyProposalCreatedEvents`
      );
      await paginateRequest(
        BountyProposalDisputedEvents,
        `getBountyProposalDisputedEvents`
      );
      await paginateRequest(
        BountyProposalRefusedEvents,
        `getBountyProposalRefusedEvents`
      );

      const mappedDisputedAndRefusedEvents = [
        ...new Set(
          BountyProposalDisputedEvents.concat(BountyProposalRefusedEvents)
        ),
      ];

      for (const BountyProposalCreatedEvent of BountyProposalCreatedEvents.flat()) {
        const { bountyId, prId, proposalId } =
          BountyProposalCreatedEvent.returnValues;

        const bounty = await currentNetwork.getBounty(bountyId);

        if (!bounty)
          return console.log("Network Bounty not found ->", bountyId);

        const { dbBounty, dbPullRequest, dbProposal, proposal } =
          await validateProposal(
            bounty,
            prId,
            proposalId,
            network?.id,
            queryInterface
          );

        if (dbBounty && dbPullRequest && !dbProposal) {
            
          const dbUser = await queryInterface.sequelize.query(
            "SELECT * FROM users WHERE address LIKE :address",
            {
              replacements: { address: proposal.creator.toLowerCase() },
              type: QueryTypes.SELECT,
            }
          );

          const createProposalId = await queryInterface.insert(
            MergeProposal,
            "merge_proposals",
            {
              refusedByBountyOwner: proposal.refusedByBountyOwner,
              disputeWeight: new BigNumber(proposal.disputeWeight).toFixed(),
              contractCreationDate: proposal.creationDate,
              issueId: dbBounty.id,
              pullRequestId: dbPullRequest.id,
              githubLogin: dbUser[0]?.githubLogin || null,
              creator: proposal.creator,
              contractId: proposal.id,
              network_id: network?.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          ).then(async (result) => {
            if(result[1] > 0){
              const res = await queryInterface.sequelize.query(
                'SELECT * FROM merge_proposals WHERE "contractId" = :contractId AND "network_id" = :networkId AND "issueId" = :issueId',
                {
                  replacements: {
                    contractId: proposal.id,
                    networkId: network.id,
                    issueId: dbBounty.id,
                  },
                  type: QueryTypes.SELECT,
                }
              )
              console.log('res', res[0].id)
              return res[0].id || null
            }
          })

          if (createProposalId) {
            await Promise.all(
              proposal.details.map(async (detail) =>
                queryInterface.insert(
                  ProposalDistributions,
                  "proposal_distributions",
                  {
                    address: detail.recipient,
                    percentage: detail.percentage,
                    proposalId: createProposalId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }
                )
              )
            );
            proposalsUpdated += 1;

          }



          await sleep();
        }
      }

      console.log(
        "mappedDisputedAndRefusedEvents",
        mappedDisputedAndRefusedEvents.length
      );

      for (const mappedDisputedAndRefusedEvent of mappedDisputedAndRefusedEvents) {
        const { bountyId, prId, proposalId } =
          mappedDisputedAndRefusedEvent.returnValues;

        const bounty = await currentNetwork.getBounty(bountyId);

        if (!bounty)
          return console.log("Network Bounty not found ->", bountyId);

        const { dbProposal, proposal } = await validateProposal(
          bounty,
          prId,
          proposalId,
          network?.id,
          queryInterface
        );
          console.log('refused and disputed')
        if (dbProposal) {
          console.log('refused and disputed in dbProposal', dbProposal.id)
          const queryUpdateProposal = `UPDATE merge_proposals SET "disputeWeight" = $disputeWeight, "refusedByBountyOwner" = $refusedByBountyOwner WHERE id = $id`;

          await queryInterface.sequelize.query(queryUpdateProposal, {
            bind: {
              disputeWeight: new BigNumber(proposal.disputeWeight).toFixed(),
              refusedByBountyOwner: proposal.refusedByBountyOwner,
              id: dbProposal.id,
            },
          });

          proposalsUpdated += 1;

          await sleep();
        }
      }
    }
  },
};
