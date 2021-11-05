import * as fs from 'fs';
import * as path from 'path';
import * as DatabaseConfig from '../config';
import {Sequelize, DataTypes, Model} from 'sequelize';

import * as Developers from './developer.model';
import * as Issues from './issue.model';
import * as Users from './user';
import * as MergeProposals from './mergeproposal';
import * as PullRequests from './pullRequest.model';
import * as Repositories from './repositories.model';

/**
 *
 * @type {{sequelize: Sequelize|null, [k: string]: Model}}
 */
const Database = {sequelize: null,};

const sequelize = new Sequelize(DatabaseConfig.database, DatabaseConfig.username, DatabaseConfig.password, DatabaseConfig);

Database.user = Users(sequelize);
Database.developer = Developers(sequelize);
Database.issue = Issues(sequelize);
Database.mergeProposal = MergeProposals(sequelize);
Database.repositories = Repositories(sequelize);
Database.pullRequest = PullRequests(sequelize);

Object.values(Database).forEach((model) => {
  if (model?.associate)
    model.associate(Database);
});

Database.sequelize = sequelize;

export default Database;
