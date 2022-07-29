import { IncomingHttpHeaders } from "http2";
import type { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

interface CustomHeader {
  get: (key: string) => string
}

type CombinedHeader = IncomingHttpHeaders & CustomHeader;

const testnet = process.env.NEXT_E2E_TESTNET === "true";

const blackList = {
  POST: ["network", "pull-request", "repos"],
  PUT: ["issue/working", "network", "pull-request/review"],
  DELETE: ["pull-request", "user", "repos"],
  PATCH: ["user/connect"]
};

const UnauthorizedResponse = 
  (reason: string) => new Response(JSON.stringify({ reason }), { status: 401, statusText: "Unauthorized" });

export async function middleware(req: NextApiRequest) {
  const method = req.method;
  const endpoint = req.url.split("api/")[1];

  const shouldCheckForToken = blackList[method]?.some(path => (new RegExp(`^${path}$`)).test(endpoint) );

  if (!testnet && shouldCheckForToken) {
    const token = await getToken({req});

    if(!token)
      return UnauthorizedResponse("Missing Token");

    const requestWallet = (req.headers as CombinedHeader).get("wallet")?.toLowerCase();
    const tokenWallet = String(token.wallet)?.toLowerCase();


    if (tokenWallet && tokenWallet !== requestWallet)
      return UnauthorizedResponse("Invalid Accounts");
  }

  try {
    return NextResponse.next();
  } catch (e) {
    return NextResponse.error();
  }
}