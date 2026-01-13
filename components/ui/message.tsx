import * as React from "react"
import { cn } from "@/lib/utils"

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from: "user" | "assistant"
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, from, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-2",
        from === "assistant" ? "items-start" : "items-end",
        className
      )}
      {...props}
    />
  )
)
Message.displayName = "Message"

const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { from?: "user" | "assistant" }
>(({ className, from, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
      from === "user"
        ? "bg-primary/80 text-primary-foreground"
        : "bg-muted text-foreground",
      className
    )}
    {...props}
  />
))
MessageContent.displayName = "MessageContent"

export { Message, MessageContent }
