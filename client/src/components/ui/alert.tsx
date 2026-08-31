import * as React from "react"
import { CircleAlert } from "lucide-react"

import { cn } from "@/lib/utils"

function Alert({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "destructive"
}) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(
        "rounded-sm border px-4 py-3 text-sm",
        variant === "destructive"
          ? "border-destructive/20 bg-destructive/10 text-destructive"
          : "border-border/60 bg-muted/40 text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-medium", className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-1 text-sm opacity-90", className)} {...props} />
}

function AlertIcon() {
  return <CircleAlert className="h-4 w-4" />
}

export { Alert, AlertDescription, AlertIcon, AlertTitle }
