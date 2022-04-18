import { NextApiRequest } from 'next'
import { getToken } from 'next-auth/jwt'
import type { NextFetchEvent } from 'next/server'
import { NextResponse } from 'next/server'

const whiteList=['auth']

export async function middleware(req: NextApiRequest, ev: NextFetchEvent) {
  const method = req.method
  const isInWhiteList = req.url.split('/api')[1].split('/').some(r=> whiteList.includes(r))
  
  if(method !== 'GET' && !isInWhiteList){
    const token = await getToken({req})
    if(!token) return new Response('Unauthorized',{
      status: 401,
    })
  }
  return NextResponse.next();
}