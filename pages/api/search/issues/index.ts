import {subHours, subMonths, subWeeks, subYears} from "date-fns";
import {NextApiRequest, NextApiResponse} from "next";
import {Op, Sequelize, WhereOptions} from "sequelize";

import models from "db/models";

import handleNetworkValues from "helpers/handleNetworksValuesApi";
import paginate, {calculateTotalPages, paginateArray} from "helpers/paginate";
import {searchPatternInText} from "helpers/string";

import {LogAccess} from "middleware/log-access";
import {WithValidChainId} from "middleware/with-valid-chain-id";
import WithCors from "middleware/withCors";

import {error} from "services/logging";

const COLS_TO_CAST = ["amount", "fundingAmount"];
const castToDecimal = columnName => Sequelize.cast(Sequelize.col(columnName), 'DECIMAL');
const iLikeCondition = (key, value) => ({[key]: {[Op.iLike]: value}});
const isZero = { [Op.eq]: "0" };

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    let networks = [];

    const {
      state,
      issueId,
      repoId,
      time,
      creator,
      address,
      search,
      page,
      pullRequesterLogin,
      pullRequesterAddress,
      proposer,
      networkName,
      allNetworks,
      repoPath,
      tokenAddress,
      chainId,
      visible
    } = req.query || {};

    const whereCondition: WhereOptions = visible
      ? { state: { [Op.notIn]: ["pending", "canceled"] } }
      : { state: { [Op.not]: "pending" } };

    if(visible) whereCondition.visible = visible;

    if (['open', 'ready', 'proposal'].includes(state?.toString())){
      whereCondition.state = {
        [Op.in]: ['open', 'ready', 'proposal']
      };
      whereCondition.fundingAmount = isZero
    } else if(state === 'funding'){
      whereCondition.fundingAmount = {
        [Op.not]: "0"
      };
    } else if(state) {
      whereCondition.state = state
      whereCondition.fundingAmount = isZero
    }

    if (issueId) whereCondition.issueId = issueId;

    if (repoId) whereCondition.repository_id = repoId;

    if (creator) whereCondition.creatorGithub = creator;

    if (address) 
      whereCondition.creatorAddress = {
        [Op.iLike]: address.toString()
      };

    if (networkName) {
      const network = await models.network.findOne({
        where: {
          name: {
            [Op.iLike]: String(networkName).replaceAll(" ", "-"),
          },
          ... chainId ? { chain_id: +chainId } : {}
        }
      });

      if (!network) return res.status(404).json("Invalid network");
      networks = [network]
      whereCondition.network_id = network?.id;
    }

    if(allNetworks) {
      networks = await models.network.findAll({
        where: {
          isRegistered: true,
          isClosed: false,
        },
        include: [
          { association: "curators" }
        ]
      })

      if (networks.length === 0) return res.status(404).json("Networks not found");

      whereCondition.network_id = {[Op.in]: networks.map(network => network.id)}
    }

    if (chainId)
      whereCondition.chain_id = { [Op.eq]: +chainId };

    if (repoPath) {
      const repository = await models.repositories.findOne({
      where: {
        githubPath: {
          [Op.in]: String(repoPath).split(",")
        }
      }
      });

      if (!repository) return res.status(404).json("Invalid repository");

      whereCondition.repository_id = repository.id;
    }

    if (time) {
      let fn;
      if (time === "week") fn = subWeeks;
      if (time === "month") fn = subMonths;
      if (time === "year") fn = subYears;
      if (time === "hour") fn = subHours;

      if (!fn) return res.status(422).json("Unable to parse date");

      whereCondition.createdAt = { [Op.gt]: fn(+new Date(), 1) };
    }

    const pullRequesterType = (login: string | string[], address: string | string[]) => {
      if(login && address) return "both"
      else if(login) return "login"
      else if(address) return "address"
      else return null
    }
    
    const pullRequester = pullRequesterType(pullRequesterLogin, pullRequesterAddress)

    const handlePrConditional = (method: "both" | "login" | "address") => {
      if(method === "both") return {
        [Op.or]: [
          iLikeCondition("githubLogin", pullRequesterLogin),
          iLikeCondition("userAddress", pullRequesterAddress),
        ],
      }

      if(method === "login") return { githubLogin: pullRequesterLogin }
      if(method === "address") return { userAddress: pullRequesterAddress }
    }

    const include = [
      { association: "developers" },
      {
        association: "pullRequests",
        required: !!pullRequester,
        where: {
          status: {
            [Op.not]: "canceled"
          },
          ...(pullRequester
            ? 
            handlePrConditional(pullRequester)
            : {}),
        }
      },
      { 
        association: "mergeProposals",
        required: !!proposer,
        where: {
          ...(proposer ? { 
            [Op.or]: [ iLikeCondition("githubLogin", proposer), iLikeCondition("creator", proposer) ] 
          } : {})
        }
      },
      { association: "repository", attributes: ["id", "githubPath"] },
      {
        association: "transactionalToken",
        required: !!tokenAddress,
        where: {
          ...(tokenAddress ? {
            address: { [Op.iLike]: tokenAddress }
          } : {})
        }
      },
      {
        association: "network",
        include: [
          { association: "chain" }
        ]
      }
    ];

    if (state === "closed")
      include.push({
        association: "payments"
      });

    if (networks.length > 0)
      include.push({ association: "network", attributes: ["colors", "name", "networkAddress"] });

    const sortBy = req?.query?.sortBy?.length && String(req?.query?.sortBy)
                                    .replaceAll(',',`,+,`)
                                    .split(',')
                                    .map((value)=> value === '+' ? Sequelize.literal('+') : 
                                      (COLS_TO_CAST.includes(value) ? castToDecimal(value) : value));

    if (search) {
      const issues = await models.issue.findAll({
        where: whereCondition,
        include,
        nest: true,
        order: [[...sortBy ||["createdAt"], req.query.order || "DESC"]]
      }).then(data => handleNetworkValues(data))

      const result = [];

      result.push(...issues.filter(({ title, body, tags }) =>
        [title, body, ...(tags || [])].some((text) =>
          searchPatternInText(text || "", String(search)))));

      const paginatedData = paginateArray(result, 10, page || 1);

      return res.status(200).json({
        count: result.length,
        rows: paginatedData.data,
        pages: paginatedData.pages,
        currentPage: +paginatedData.page
      });
    } else {
      const issues = await models.issue.findAndCountAll(paginate({ 
        where: whereCondition, 
        include, 
        nest: true 
      }, req.query, [
        [...sortBy|| ["createdAt"], req.query.order || "DESC"]
      ]))
        .then(data => handleNetworkValues(data));

      return res.status(200).json({
      ...issues,
      currentPage: +page || 1,
      pages: calculateTotalPages(issues.count)
      })}
  } catch(e){
    error(e);
    return res.status(500)
  }
}

async function SearchIssues(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default LogAccess(WithCors(WithValidChainId(SearchIssues)));
