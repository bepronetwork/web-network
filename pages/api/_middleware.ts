import type { NextApiRequest } from 'next'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import {error, info} from "../../helpers/api/handle-log";

const testnet = process.env.NEXT_E2E_TESTNET === "true" ? true : false;

const blackList = {
  GET: ['auth', 'past-events', 'seo', 'users', 'graphql'],
  POST: ['issue']
}

const ignoreLogPaths = ['health'];

export async function middleware(req: NextApiRequest) {
  const method = req.method;
  const shouldCheckForToken = blackList[method]?.some(path => req.url.replace('/api/', '').search(path) > -1);

  const {page = {}, url, ip, ua, body} = req as any;
  const {pathname, search,} = new URL(url);

  if (!ignoreLogPaths.some(k => pathname.includes(k)))
    info('Access', {method, ip, ua, ...page, pathname, search, body});

  if (!testnet && shouldCheckForToken) {
    if(!await getToken({req}))
      return new Response(JSON.stringify({reason: "Missing token"}),{status: 401, statusText: "Unauthorized"});
  }

  try {
    return NextResponse.next();
  } catch (e) {
    error(e.message, e);
    return NextResponse.error();
  }
}