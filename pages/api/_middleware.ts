import { IncomingHttpHeaders } from "http2";
import type { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

interface CustomHeader {
  get: (key: string) => string
}

type CombinedHeader = IncomingHttpHeaders & CustomHeader;

const testnet = process.env.NEXT_E2E_TESTNET === "true";

const pastEventsEvents =  ["created", "canceled", "closed", "disputed", "ready", "updated", "refused", "funded"];
const pastEventsEntities = ["bounty", "proposal", "pull-request"];
const pastEventsEndPoints = 
  pastEventsEntities.flatMap(entity => pastEventsEvents.map(event => `past-events/${entity}/${event}`));

const whiteList = {
  POST: [ "auth/_log",
          "auth/signin/github",
          "auth/signout",
          "graphql", 
          "issue", 
          "search/users/address", 
          "search/users/all", 
          "search/users/login", 
          "search/users/total", 
          "seo",
          "past-events/bulk",
          ...pastEventsEndPoints ]
};

const UnauthorizedResponse = 
  (reason: string) => new Response(JSON.stringify({ reason }), { status: 401, statusText: "Unauthorized" });

export async function middleware(req: NextApiRequest) {
  const method = req.method;

  const shouldCheckForToken = 
    method !== "GET" && !whiteList[method]?.some(path => (new RegExp(`${path}$`)).test(req.url) );

  if (!testnet && shouldCheckForToken) {
    const token = await getToken({req});

    if(!token)
      return UnauthorizedResponse("Missing Token");

    const requestWallet = (req.headers as CombinedHeader).get("wallet")?.toLowerCase();
    const tokenWallet = (token.wallet as string)?.toLowerCase();

    if (tokenWallet && requestWallet !== "" && tokenWallet !== requestWallet)
      return UnauthorizedResponse("Invalid Accounts");
  }

  try {
    return NextResponse.next();
  } catch (e) {
    return NextResponse.error();
  }
}