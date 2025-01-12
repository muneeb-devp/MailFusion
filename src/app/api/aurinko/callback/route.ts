import { exchangeCodeForAccessToken, getAccount } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {

}

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const status = params.get('status');

  if (status !== 'success') return NextResponse.json({ error: 'Failed to link account' }, { status: 500 });

  console.log('Code is: ' + params.get('code'));
  const code = params.get('code');
  if (!code) return NextResponse.json({ error: 'Auth code not provided' }, { status: 400 });

  const token = await exchangeCodeForAccessToken(code);
  if (!token) return NextResponse.json({ error: 'Failed to exchange auth code' }, { status: 500 });

  const accountDetails = await getAccount(token.accessToken);

  await db.account.upsert({
    where: {
      id: token.accountId.toString()
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


  return NextResponse.json({ msg: 'Hello world' })
}