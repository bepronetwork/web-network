import {Sequelize} from "sequelize";

import * as DatabaseConfig from "../config";
import ChainEvents from "./chain-events.model";
import Developers from "./developer.model";
import Issues from "./issue.model";
import MergeProposals from "./mergeproposal";
import Network from "./network.model";
import Repositories from "./repositories.model";
import User from "./user";
import Tokens from "./tokens.model";
import NetworkTokens from "./network-tokens.model";
import UserPayments from "./user-payments";
import Settings from "./settings.model";
import Benefactors from './benefactor.model';
import Curators from './curator-model'
import Disputes from './dispute-model';
import LeaderBoard from './leaderboard.model';
import Chain from "./chain.model";
import ProposalDistributions from './proposal-distributions.model';
import HeaderInformation from './header-information';
import KycSession from './kyc-session.model'
import Delegation from './delegation.model'
import Comments from './comments.model'
import Deliverables from './deliverable.model'

const Database = { sequelize: null };

const sequelize = new Sequelize(DatabaseConfig.database,
  DatabaseConfig.username,
  DatabaseConfig.password,
  DatabaseConfig);

Database.user = User;
Database.developer = Developers;
Database.issue = Issues;
Database.mergeProposal = MergeProposals;
Database.repositories = Repositories;
Database.chainEvents = ChainEvents;
Database.network = Network;
Database.tokens = Tokens;
Database.networkTokens = NetworkTokens;
Database.benefactor = Benefactors;
Database.userPayments = UserPayments;
Database.settings = Settings;
Database.curator = Curators;
Database.dispute = Disputes;
Database.leaderBoard = LeaderBoard;
Database.proposalDistributions = ProposalDistributions;
Database.chain = Chain;
Database.headerInformation = HeaderInformation;
Database.kycSession = KycSession;
Database.delegation = Delegation;
Database.comments = Comments;
Database.deliverable = Deliverables;


Object.values(Database).forEach((model) => {
  if (model?.init) {
    model.init(sequelize);
  }
});

Object.values(Database).forEach((model) => {
  if (model?.associate) {
    model.associate(sequelize.models);
  }
});

Database.sequelize = sequelize;

export default Database;
