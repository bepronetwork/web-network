import BigNumber from "bignumber.js";
import {subHours, subMonths, subWeeks, subYears} from "date-fns";
import {ParsedUrlQuery} from "querystring";
import {Op, Sequelize, WhereOptions} from "sequelize";

import models from "db/models";

import { getDeveloperAmount } from "helpers/calculateDistributedAmounts";
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
    deliverabler,
    network,
    networkName,
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

  if (!creator)
    // Issue table columns
    whereCondition.state = {
      [Op.notIn]: defaultStatesToIgnore
    };

  if (state && !["disputable", "mergeable"].includes(state?.toString())) {
    if (state === "funding")
      whereCondition.fundingAmount = {
        [Op.and]: [
          { [Op.ne]: "0" },
          { [Op.ne]: Sequelize.literal('"issue"."fundedAmount"') },
        ]
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
    whereCondition.id = +issueId;

  if (chainId) 
    whereCondition.chain_id = +chainId;
  
  if (typeof visible !== "undefined" && visible !== "both") 
    whereCondition.visible = isTrue(visible.toString());
  else if (visible !== "both")
    whereCondition.visible = true;

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
                      contractId: { [Op.not]: null },
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

  const deliverableAssociation = 
    getAssociation( "deliverables", 
                    undefined, 
                    !!deliverabler, 
                    { prContractId: { [Op.not]: null } },
                    [getAssociation("user", undefined, !!deliverabler, deliverabler ? {
                      address: caseInsensitiveEqual("address", deliverabler.toString())
                    }: {})]);

  const networkAssociation = 
    getAssociation( "network", 
                    [
                      "colors",
                      "name",
                      "networkAddress",
                      "disputableTime",
                      "logoIcon",
                      "fullLogo",
                      "mergeCreatorFeeShare",
                      "proposerFeeShare"
                    ], 
                    true, 
                    networkName === 'all' ? {} : (networkName || network) ? { 
                      name: caseInsensitiveEqual("network.name", (networkName || network).toString())
                    } : {},
                    [getAssociation("chain", ["chainId", "chainShortName", "color"], true, chain ? {
                      chainShortName: { [Op.iLike]: chain.toString()}
                    } : {})]);

  const transactionalTokenAssociation = 
    getAssociation( "transactionalToken", 
                    ["address", "name", "symbol"], 
                    !!transactionalTokenAddress, 
                    transactionalTokenAddress ? { address: { [Op.iLike]: transactionalTokenAddress.toString() } } : {});

  const userAssociation = getAssociation("user", undefined, !!creator, creator ? {
    address: caseInsensitiveEqual("user.address", creator.toString())
  } : {});

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
    sort.push("createdAt");

  const useSubQuery = isMergeableState || isDisputableState || deliverabler ? false : undefined;

  const issues = await models.issue.findAndCountAll(paginate({
    subQuery: useSubQuery,
    logging: console.log,
    where: whereCondition,
    include: [
      networkAssociation,
      proposalAssociation,
      deliverableAssociation,
      transactionalTokenAssociation,
      userAssociation,
    ]
  }, { page: PAGE }, [[...sort, order || "DESC"]], RESULTS_LIMIT))
    .then(result => {
      const rows = result.rows.map(issue => {
        issue.dataValues.developerAmount = getDeveloperAmount(issue.network.mergeCreatorFeeShare,
                                                              issue.network.proposerFeeShare,
                                                              BigNumber(issue?.amount));
        return issue;
      });

      return {
        ...result,
        rows
      }
    }); 
  
  const actions = {
      deliverabler: async () => {
        return models.deliverable.count({
          subQuery: false,
          where: { prContractId: { [Op.not]: null } },
          include: [
            getAssociation("user", undefined, !!deliverabler, deliverabler ? {
              address: caseInsensitiveEqual("address", deliverabler.toString())
            }: {}),
            getAssociation("issue", undefined, true, {}, [
              getAssociation("network", undefined, true, networkName === 'all' ? {} : networkName || network ? 
              { 
                name: caseInsensitiveEqual("name", (networkName || network).toString())
              } : {}, [])])
          ]
        });
      },
      proposer: async () => {
        return models.mergeProposal.count({
          where: {
            ...proposer ? { creator: caseInsensitiveEqual("creator", proposer.toString()) } : {}
          },
          include: [
            networkAssociation
          ]
        });
      },
      default: async () => {
        return models.issue.count({
          where: {
            state: {
              [Op.notIn]: ["pending", "canceled"],
            },
            visible: true,
          }
        });
      },
  };

  const action = actions[deliverabler && 'deliverabler' || proposer && 'proposer' || 'default'];
  const total = await action();

  return {
    ...issues,
    currentPage: PAGE,
    pages: calculateTotalPages(issues.count, RESULTS_LIMIT),
    totalBounties: total
  };
}