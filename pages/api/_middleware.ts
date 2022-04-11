import { NextApiRequest } from 'next'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextFetchEvent } from 'next/server'

export async function middleware(req: NextApiRequest, ev: NextFetchEvent) {
  const method = req.method
  if(method !== 'GET'){
    const token = await getToken({req})
    if(!token) return new Response('Unauthorized',{
      status: 401,
    })
  }
  return NextResponse.next()
}