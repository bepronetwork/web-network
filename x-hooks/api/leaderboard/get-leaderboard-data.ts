import { ParsedUrlQuery } from "querystring";

import { api } from "services/api";

import { LeaderBoardPaginated } from "types/api";

/**
 * Get leaderboard from api based on query filters
 * @param query current url query
 * @returns leaderboard data
 */
export async function getLeaderboardData(query: ParsedUrlQuery) {
  return api.get<LeaderBoardPaginated>("/search/leaderboard", {
    params: query
  });
}