import * as DatabaseConfig from '../config';
import {Sequelize, DataTypes, Model} from 'sequelize';

import * as Developers from './developer.model';
import * as Issues from './issue.model';
import User from './user';
import * as MergeProposals from './mergeproposal';
import * as PullRequests from './pullRequest.model';
import * as Repositories from './repositories.model';
import * as ChainEvents from './chain-events.model';

const Database = {sequelize: null,};

const sequelize = new Sequelize(DatabaseConfig.database, DatabaseConfig.username, DatabaseConfig.password, DatabaseConfig);

Database.user = User(sequelize);
Database.developer = Developers(sequelize);
Database.issue = Issues(sequelize);
Database.mergeProposal = MergeProposals(sequelize);
Database.repositories = Repositories(sequelize);
Database.pullRequest = PullRequests(sequelize);
Database.chainEvents = ChainEvents(sequelize);

Object.values(Database).forEach((model) => {
  if (model?.associate)
    model.associate(Database);
});

Database.sequelize = sequelize;

export default Database;
