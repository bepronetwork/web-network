import {subHours, subMonths, subWeeks, subYears} from "date-fns";
import {ParsedUrlQuery} from "querystring";
import {Op, Sequelize, WhereOptions} from "sequelize";

import models from "db/models";

import {caseInsensitiveEqual} from "helpers/db/conditionals";
import {getAssociation} from "helpers/db/models";
import paginate, {calculateTotalPages} from "helpers/paginate";
import {isTrue} from "helpers/string";

export default async function get(query: ParsedUrlQuery) {
  const {
    state,
    issueId,
    chainId,
    proposalId,
    chain,
    visible,
    creator,
    proposer,
    pullRequester,
    network,
    networkName,
    repoId,
    transactionalTokenAddress,
    time,
    search,
    page,
    count,
    sortBy,
    order
  } = query;

  const whereCondition: WhereOptions = {};

  const defaultStatesToIgnore = ["pending", "canceled"];

  if (["disputable", "mergeable", "proposable"].includes(state?.toString()))
    defaultStatesToIgnore.push("closed", "draft");

  // Issue table columns
  whereCondition.state = {
    [Op.notIn]: defaultStatesToIgnore
  };

  if (state && !["disputable", "mergeable"].includes(state.toString())) {
    if (state === "funding")
      whereCondition.fundingAmount = {
        [Op.ne]: "0",
        [Op.ne]: Sequelize.literal('"issue"."fundedAmount"'),
      };
    else if (state === "open") {
      whereCondition.state[Op.in] = ["open", "ready", "proposal"];
      whereCondition.fundingAmount = {
        [Op.eq]: Sequelize.literal('"issue"."fundedAmount"')
      };
    } else if (state === "proposable")
      whereCondition.state[Op.eq] = "ready";
    else
      whereCondition.state[Op.eq] = state;
  }

  if (issueId) 
    whereCondition.issueId = issueId;

  if (chainId) 
    whereCondition.chain_id = +chainId;
  
  if (typeof visible !== "undefined" && visible !== "both") 
    whereCondition.visible = isTrue(visible.toString());
  else if (visible !== "both")
    whereCondition.visible = true;

  if (creator) 
    whereCondition.creatorAddress = {
      [Op.iLike]: `%${creator.toString()}%`
    };

  // Time filter
  if (time) {
    const subFn = {
      week: subWeeks,
      month: subMonths,
      year: subYears,
      hour: subHours,
    }

    if (subFn[time.toString()]) 
      whereCondition.createdAt = { 
        [Op.gt]: subFn[time.toString()](+new Date(), 1) 
      };
  }

  if (search) {
    Object.assign(whereCondition, {
      [Op.or]: [
        { title: { [Op.iLike]: `%${search}%` } },
        { body: { [Op.iLike]: `%${search}%` } },
      ]
    });
  }

  // Associations
  const isMergeableState = state === "mergeable";
  const isDisputableState = state === "disputable";
  const operator = isMergeableState ? Op.gte : Op.lte;
  const disputableTimeCalc = `"mergeProposals"."createdAt" + interval '1 second' * "network"."disputableTime" / 1000`;
  
  const proposalAssociation = 
    getAssociation( "mergeProposals", 
                    undefined, 
                    !!proposer || !!proposalId || isMergeableState || isDisputableState, 
                    {
                      ... proposer ? { creator: { [Op.iLike]: proposer.toString() } } : {},
                      ... proposalId ? { id: proposalId } : {},
                      ... isMergeableState || isDisputableState ? {
                        [Op.and]: [
                          { isDisputed: false },
                          { refusedByBountyOwner: false },
                          Sequelize.where(Sequelize.fn("now"),
                                          operator,
                                          Sequelize.literal(disputableTimeCalc))
                        ]
                      } : {}
                    },
                    proposalId ? [
                        {
                          association: "disputes"
                        }
                    ] : []);

  const pullRequestAssociation = 
    getAssociation( "pullRequests", 
                    undefined, 
                    !!pullRequester, 
                    {
                      status: {
                        [Op.not]: "canceled",
                      },
                      ... pullRequester ? { userAddress: { [Op.iLike]: pullRequester.toString() } } : {}
                    });

  const networkAssociation = 
    getAssociation( "network", 
                    ["colors", "name", "networkAddress", "disputableTime", "logoIcon", "fullLogo"], 
                    true, 
                    networkName || network ? { 
                      networkName: caseInsensitiveEqual("network.name", (networkName || network).toString())
                    } : {},
                    [getAssociation("chain", ["chainId", "chainShortName", "color"], true, chain ? {
                      chainShortName: { [Op.iLike]: chain.toString()}
                    } : {})]);

  const repositoryAssociation = 
    getAssociation( "repository", 
                    ["id", "githubPath"], 
                    !!repoId, 
                    repoId ? { 
                      id: +repoId
                    } : {});

  const transactionalTokenAssociation = 
    getAssociation( "transactionalToken", 
                    ["address", "name", "symbol"], 
                    !!transactionalTokenAddress, 
                    transactionalTokenAddress ? { address: { [Op.iLike]: transactionalTokenAddress.toString() } } : {});

  const COLS_TO_CAST = ["amount", "fundingAmount"];
  const RESULTS_LIMIT = count ? +count : undefined;
  const PAGE = +(page || 1);
  const sort = [];
  
  if (sortBy) {
    const columns = sortBy
      .toString()
      .replaceAll(",", ",+,")
      .split(",")
      .map(column => {
        if (column === "+") return Sequelize.literal("+");
        if (COLS_TO_CAST.includes(column)) return Sequelize.cast(Sequelize.col(column), "DECIMAL");

        return column;
      });

    sort.push(...columns);
  } else
    sort.push("updatedAt");

  const useSubQuery = isMergeableState || isDisputableState ? false : undefined;

  const issues = await models.issue.findAndCountAll(paginate({
    subQuery: useSubQuery,
    logging: console.log,
    where: whereCondition,
    include: [
      networkAssociation,
      proposalAssociation,
      pullRequestAssociation,
      repositoryAssociation,
      transactionalTokenAssociation,
    ]
  }, { page: PAGE }, [[...sort, order || "DESC"]], RESULTS_LIMIT));

  const totalBounties = await models.issue.count({
    where: {
      state: {
        [Op.notIn]: ["pending", "canceled"]
      }
    }
  });

  return {
    ...issues,
    currentPage: PAGE,
    pages: calculateTotalPages(issues.count, RESULTS_LIMIT),
    totalBounties
  };
}