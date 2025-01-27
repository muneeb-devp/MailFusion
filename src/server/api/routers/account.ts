import { z } from 'zod'
import { createTRPCRouter, privateProdcedure } from '../trpc'
import { db } from '@/server/db'
import { Prisma } from '@prisma/client'

export const authoriseAccountAccess = async (accountId: string, userId: string) => {
  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId
    },
    select: {
      id: true,
      email: true,
      name: true,
      accessToken: true
    }
  })

  if (!account) throw new Error('Account not found')

  return account
}

export const accountRouter = createTRPCRouter({
  getAccounts: privateProdcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId
      },
      select: {
        id: true, email: true, name: true
      }
    })
  }),

  getNumThreads: privateProdcedure.input(z.object({
    accountId: z.string(),
    tab: z.string()
  })).query(async ({ ctx, input }) => {
    const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
    let filter: Prisma.ThreadWhereInput = {}

    if (input.tab === 'inbox') filter.inboxStatus = true
    else if (input.tab === 'draft') filter.draftStatus = true
    else if (input.tab === 'sent') filter.sentStatus = true

    return await ctx.db.thread.count({
      where: {
        accountId: account.id,
        ...filter
      }
    })
  }),

  getThreads: privateProdcedure.input(z.object({
    accountId: z.string(),
    tab: z.string(),
    done: z.boolean()
  })).query(async ({ ctx, input }) => {
    const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)

    let filter: Prisma.ThreadWhereInput = {}
    if (input.tab === 'inbox') filter.inboxStatus = true
    else if (input.tab === 'draft') filter.draftStatus = true
    else if (input.tab === 'sent') filter.sentStatus = true

    filter.done = {
      equals: input.done
    }

    return await ctx.db.thread.findMany({
      where: filter,
      include: {
        emails: {
          orderBy: { sentAt: 'asc' },
          select: {
            from: true,
            body: true,
            bodySnippet: true,
            emailLabel: true,
            subject: true,
            sysLabels: true,
            id: true,
            sentAt: true
          }
        }
      }, take: 15, orderBy: { lastMessageDate: 'desc' }
    })
  })
})