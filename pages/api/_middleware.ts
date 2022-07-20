import type { NextApiRequest } from 'next'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

const testnet = process.env.NEXT_E2E_TESTNET === "true" ? true : false;

const whiteList = ['auth', 'past-events', 'seo', 'users', 'graphql'];

export async function middleware(req: NextApiRequest) {
  const method = req.method
  const isInWhiteList = req.url?.split('/api')?.[1]?.split('/')?.some(r=> whiteList.includes(r));

  if(method !== 'GET' && !isInWhiteList && !testnet){
    const token = await getToken({req})
    if(!token) return new Response('Unauthorized',{
      status: 401,
    })
  }

  try {
    return NextResponse.next();
  } catch (e) {
    return NextResponse.error();
  }
}