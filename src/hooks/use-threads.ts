import React from 'react'

import { api } from '@/trpc/react'
import { useLocalStorage } from 'usehooks-ts'
import { atom, useAtom } from 'jotai'

export const threadIdAtom = atom<string | null>(null)

const useThreads = () => {
  const { data: accounts } = api.account.getAccounts.useQuery()
  const [accountId] = useLocalStorage('accountId', '')
  const [tab] = useLocalStorage<'inbox' | 'draft' | 'sent'>('mailfusion-tab', 'inbox')
  const [done] = useLocalStorage('mailfusion-done', false)
  const [threadId, setThreadId] = useAtom(threadIdAtom)

  const { data: threads, isFetching, refetch } = api.account.getThreads.useQuery({
    accountId,
    tab,
    done
  }, {
    enabled: !!accountId && !!tab, placeholderData: e => e, refetchInterval: 5_000
  })

  return {
    isFetching,
    refetch,
    threads,
    accountId,
    threadId,
    setThreadId,
    account: accounts?.find(a => a.id === accountId),
  }
}

export default useThreads