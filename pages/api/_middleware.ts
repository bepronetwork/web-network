import type { NextApiRequest } from 'next'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

const testnet = process.env.NEXT_E2E_TESTNET === "true";

const blackList = {
  GET: ['auth', 'past-events', 'seo', 'users', 'graphql'],
  POST: ['issue']
}



export async function middleware(req: NextApiRequest) {
  const method = req.method;
  const shouldCheckForToken = blackList[method]?.some(path => req.url.replace('/api/', '').search(path) > -1);

  if (!testnet && shouldCheckForToken)
    if(!await getToken({req}))
      return new Response(JSON.stringify({reason: "Missing token"}),{status: 401, statusText: "Unauthorized"});

  try {
    return NextResponse.next();
  } catch (e) {
    return NextResponse.error();
  }
}