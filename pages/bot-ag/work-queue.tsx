import React, { useState, useEffect } from 'react'
import { TheLayout } from '@/components/TheLayout'
import axios from '@/lib/axios'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PaginationSelect from '@/components/PaginationSelect'
import { Params } from '@/data/interfaceDefault'
import { ExtendedAgQueueJobDB } from '@/data/interface'
import { usePermissions } from '@/hooks/usePermissions'
import { useQuery } from '@tanstack/react-query'

type WorkQueueListResp = {
  success: boolean
  data: ExtendedAgQueueJobDB[]
  pagination?: { totalPages?: number }
  error?: string
}

const statusColorByType = (status?: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 border border-yellow-400'
    case 'SUCCESS': return 'bg-green-100 text-green-800 border border-green-400'
    case 'FAILED': return 'bg-red-100 text-red-800 border border-red-400'
    case 'RUNNING': return 'bg-blue-100 text-blue-800 border border-blue-400'
    default: return 'bg-gray-100 text-gray-800 border border-gray-400'
  }
}

const typeColorByType = (type?: string) => {
  switch (type) {
    case 'credit': return 'bg-purple-100 text-purple-800 border border-purple-400'
    case 'adjust': return 'bg-orange-100 text-orange-800 border border-orange-400'
    case 'transfer': return 'bg-cyan-100 text-cyan-800 border border-cyan-400'
    default: return 'bg-gray-100 text-gray-800 border border-gray-400'
  }
}

export default function WorkQueuePage() {
  const { isSuperAdmin } = usePermissions()
  const [params, setParams] = useState<Params>({
    page: 1,
    pageSize: 10,
    keyword: '',
    totalPages: 1,
  })
  const [workQueues, setWorkQueues] = useState<ExtendedAgQueueJobDB[]>([])

  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<WorkQueueListResp, Error>({
    queryKey: ['work-queues', params.page, params.pageSize, params.keyword] as const,
    queryFn: async () => {
      const res = await axios.get<WorkQueueListResp>('/api/work-queue', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          keyword: params.keyword || '',
        },
      })
      if (!res.data?.success) {
        throw new Error(res.data?.error || 'โหลดข้อมูล Work Queue ล้มเหลว')
      }
      return res.data
    },
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: true,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (queryData?.data) setWorkQueues(queryData.data)
    if (queryData?.pagination?.totalPages) {
      setParams((prev) => ({ ...prev, totalPages: queryData.pagination!.totalPages! }))
    }
  }, [queryData])

  useEffect(() => {
    const onFocus = () => { refetch() }
    const onVisible = () => { if (!document.hidden) refetch() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refetch])

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  useEffect(() => {
    console.log(`workQueues : `, workQueues);
  }, [workQueues])

  return (
    <TheLayout>
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-2 sm:mb-4">
          <div>
            <h1 className="flex items-center text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900">
              จัดการ Work Queue
            </h1>
            {isSuperAdmin && <p className="text-sm text-blue-600 mt-1">🔑 Super Admin - สิทธิ์เต็ม</p>}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          {isLoading ? (
            <div className="text-sm text-gray-500">กำลังโหลดข้อมูล...</div>
          ) : isError ? (
            <div className="text-sm text-red-600">
              {(error as Error)?.message || 'โหลดข้อมูลล้มเหลว'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Event Doc ID</TableHead>
                      <TableHead>Queue Size</TableHead>
                      <TableHead>Error Message</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workQueues.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{(params.page - 1) * params.pageSize + index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{item.jobId}</TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${typeColorByType(item.type)}`}>
                            {item.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-400">
                            {item.priority}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusColorByType(item.status)}`}>
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.eventDocId ? (
                            <span className="text-blue-600">{item.eventDocId}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.queueSize !== null && item.queueSize !== undefined ? (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-400">
                              {item.queueSize}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {item.errorMessage ? (
                            <div className="text-red-600 text-sm truncate" title={item.errorMessage}>
                              {item.errorMessage}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(item.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(item.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 sm:mt-6">
                <PaginationSelect
                  params={params}
                  setParams={setParams}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </TheLayout>
  )
}