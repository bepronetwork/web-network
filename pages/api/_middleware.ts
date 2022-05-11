import type { NextApiRequest } from 'next'
import { getToken } from 'next-auth/jwt'
import type { NextFetchEvent } from 'next/server'
import { NextResponse } from 'next/server'

import { error, info } from 'helpers/api/handle-log'

const whiteList = ['auth', 'past-events'];
const ignorePaths = ['health'];

export async function middleware(req: NextApiRequest, ev: NextFetchEvent) {
  const method = req.method
  const isInWhiteList = req.url?.split('/api')?.[1]?.split('/')?.some(r=> whiteList.includes(r));

  const {page = {}, url, ip, ua, body} = req as any;
  const {pathname, search,} = new URL(url);
  
  
  if (!ignorePaths.some(k => pathname.includes(k)))
    info({method, ip, ua, ...page, pathname, search, body});


  if(method !== 'GET' && !isInWhiteList){
    const token = await getToken({req})
    if(!token) return new Response('Unauthorized',{
      status: 401,
    })
  }

  try {
    return NextResponse.next();
  } catch (e) {
    error(e);
    return NextResponse.error();
  }
}