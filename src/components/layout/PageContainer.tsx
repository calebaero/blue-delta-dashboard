import { useState, useEffect, type ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface PageContainerProps {
  children: ReactNode
  title?: string
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}

export function PageContainer({ children, title }: PageContainerProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-7xl">
        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            {title && (
              <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                {title}
              </h1>
            )}
            {children}
          </>
        )}
      </div>
    </div>
  )
}
