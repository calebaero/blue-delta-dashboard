import { Check } from "lucide-react"
import type { OrderStatus, PipelineStage } from "@/data/types"

const STAGE_ORDER: OrderStatus[] = [
  "Order Received",
  "Pattern Drafting",
  "Cutting",
  "Sewing",
  "Finishing",
  "QC",
  "Shipped",
]

const STAGE_COLORS: Record<OrderStatus, string> = {
  "Order Received": "bg-slate-500",
  "Pattern Drafting": "bg-blue-500",
  Cutting: "bg-cyan-500",
  Sewing: "bg-indigo-500",
  Finishing: "bg-violet-500",
  QC: "bg-amber-500",
  Shipped: "bg-emerald-500",
}

interface PipelineStepperProps {
  currentStatus: OrderStatus
  stages: PipelineStage[]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[date.getMonth()]} ${date.getDate()}`
}

function getDaysInStage(stage: PipelineStage): string {
  const start = new Date(stage.enteredAt)
  const end = stage.exitedAt ? new Date(stage.exitedAt) : new Date()
  const days = Math.floor(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (days === 0) return "Today"
  return `${days}d`
}

export function PipelineStepper({
  currentStatus,
  stages,
}: PipelineStepperProps) {
  const currentIdx = STAGE_ORDER.indexOf(currentStatus)
  const stageMap = new Map(stages.map((s) => [s.stage, s]))

  return (
    <div className="space-y-0">
      {STAGE_ORDER.map((stageName, idx) => {
        const isCompleted = idx < currentIdx
        const isCurrent = idx === currentIdx
        const isFuture = idx > currentIdx
        const stageData = stageMap.get(stageName)

        return (
          <div key={stageName} className="flex gap-3">
            {/* Vertical line + circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? `${STAGE_COLORS[stageName]} border-transparent text-white`
                    : isCurrent
                      ? `border-indigo-600 bg-indigo-600 text-white`
                      : "border-muted bg-muted/30"
                }`}
              >
                {isCompleted ? (
                  <Check className="size-3.5" />
                ) : (
                  <span
                    className={`text-xs font-semibold ${
                      isFuture ? "text-muted-foreground" : ""
                    }`}
                  >
                    {idx + 1}
                  </span>
                )}
              </div>
              {idx < STAGE_ORDER.length - 1 && (
                <div
                  className={`h-8 w-0.5 ${
                    isCompleted ? "bg-indigo-300 dark:bg-indigo-700" : "bg-border"
                  }`}
                />
              )}
            </div>

            {/* Label + meta */}
            <div className="pb-6 pt-0.5">
              <p
                className={`text-sm font-medium ${
                  isFuture ? "text-muted-foreground" : ""
                }`}
              >
                {stageName}
              </p>
              {stageData && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(stageData.enteredAt)}</span>
                  <span>·</span>
                  <span>{getDaysInStage(stageData)}</span>
                  {stageData.artisan && (
                    <>
                      <span>·</span>
                      <span>{stageData.artisan}</span>
                    </>
                  )}
                </div>
              )}
              {isFuture && !stageData && (
                <p className="text-xs text-muted-foreground">Pending</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
