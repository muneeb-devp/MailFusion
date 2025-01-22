import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from '@vercel/functions'
import axios from "axios";

export async function POST(req: Request) {

}

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const status = params.get('status');

  if (status !== 'success') return NextResponse.json({ error: 'Failed to link account' }, { status: 500 });

  const code = params.get('code');
  if (!code) return NextResponse.json({ error: 'Auth code not provided' }, { status: 400 });

  const token = await exchangeCodeForAccessToken(code);
  if (!token) return NextResponse.json({ error: 'Failed to exchange auth code' }, { status: 500 });

  const accountDetails = await getAccountDetails(token.accessToken);
  const accountId = token.accountId.toString()

  await db.account.upsert({
    where: {
      id: accountId
    },
    update: {
      accessToken: token.accessToken
    },
    create: {
      id: token.accountId.toString(),
      userId,
      email: accountDetails.email,
      name: accountDetails.name,
      accessToken: token.accessToken
    }
  });

  // Sync emails
  waitUntil(
    axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mail-sync`, {
      accountId,
      userId
    }
    ).then(resp => console.log(resp.data))
      .catch(err => console.error(err))
  )

  // return NextResponse.json({ msg: 'Hello world' })
  return NextResponse.redirect(new URL('/mail', req.url))
}