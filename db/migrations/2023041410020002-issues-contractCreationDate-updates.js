const { Web3Connection, Network_v2 } = require("@taikai/dappkit");
const { Op } = require("sequelize");

const ChainModel = require("../models/chain.model");
const NetworkModel = require("../models/network.model");
const IssueModel = require("../models/issue.model");
const TokenModel = require("../models/tokens.model");
const RepositoryModel = require("../models/repositories.model");
const MergeProposalModel = require("../models/mergeproposal");
const CuratorsModel = require("../models/curator-model");
const BenefactorModel = require("../models/benefactor.model");
const DisputeModel = require("../models/dispute-model");
const UserPaymentsModel = require("../models/user-payments");
const DeveloperModel = require("../models/developer.model");

const { SKIP_MIGRATION_SEED_CONTRACT_DATE_ISSUE } = process.env;

async function up(queryInterface, Sequelize) {
    
  if (SKIP_MIGRATION_SEED_CONTRACT_DATE_ISSUE === "true") return;

  [
    ChainModel,
    NetworkModel,
    IssueModel,
    CuratorsModel,
    RepositoryModel,
    MergeProposalModel,
    TokenModel,
    BenefactorModel,
    DisputeModel,
    UserPaymentsModel,
    DeveloperModel
  ].forEach(model => model.init(queryInterface.sequelize));

  [ChainModel, NetworkModel, IssueModel].forEach((model) =>
    model.associate(queryInterface.sequelize.models)
  );

  const chains = await ChainModel.findAll({
    where: {
      registryAddress: {
        [Op.ne]: null,
      },
    },
    include: [
      {
        association: "networks",
        required: true,
        include: [
          {
            association: "issues",
            where: {
              state: { [Op.not]: "pending" },
            },
            required: true,
          },
        ],
      },
    ],
  });

  if (!chains.length) return;

  try {
    for (const { chainRpc, networks } of chains) {
      const web3Connection = new Web3Connection({
        skipWindowAssignment: true,
        web3Host: chainRpc,
      });

      await web3Connection.start();

      for (const { networkAddress, issues } of networks) {
        const networkV2 = new Network_v2(web3Connection, networkAddress);

        await networkV2.loadContract();

        for (const issue of issues) {
          const bounty = await networkV2.getBounty(issue?.contractId);

          if (!bounty?.creationDate && !issue?.contractCreationDate) continue;

          issue.contractCreationDate = bounty.creationDate.toString()
          await issue.save()
        }
      }
    }
  } catch (error) {
    console.log(
      "Failed to update contract creation date bounty: ",
      error.toString()
    );
  }
}

module.exports = { up };
