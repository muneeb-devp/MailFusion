import { Account } from "@/lib/account";
import { db } from "@/server/db";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const { accountId, userId } = await req.json()

  if (!accountId || !userId)
    return Response.json({ error: 'Missing accountId or userId.' }, { status: 400 });

  const dbAccount = await db.account.findUnique({
    where: {
      id: accountId,
      userId
    }
  })

  if (!dbAccount)
    return Response.json({ error: 'Account not found' }, { status: 404 });

  const account = new Account(dbAccount.accessToken);
  const response = await account.performInitialSync();

  if (!response)
    return NextResponse.json({ error: 'Failed to sync emails' }, { status: 500 });

  const { emails, deltaToken } = response


  await db.account.update({
    where: {
      id: accountId
    },
    data: {
      deltaToken
    }
  })

  await syncEmailsToDatabase(emails);

  console.log('Sync completed', deltaToken)
  return NextResponse.json({ success: true }, { status: 200 })
}