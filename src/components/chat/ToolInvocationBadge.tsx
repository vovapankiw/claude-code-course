"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getToolMessage } from "@/lib/utils/tool-invocation-messages";

interface ToolInvocationBadgeProps {
  toolInvocation: {
    toolCallId: string;
    args: any;
    toolName: string;
    state: string;
    result?: any;
  };
  className?: string;
}

export function ToolInvocationBadge({
  toolInvocation,
  className,
}: ToolInvocationBadgeProps) {
  const message = getToolMessage(toolInvocation.toolName, toolInvocation.args);
  const isCompleted = toolInvocation.state === "result" && toolInvocation.result;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 mt-2 px-3 py-1.5",
        "bg-neutral-50 rounded-lg text-xs font-mono",
        "border border-neutral-200",
        className
      )}
    >
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
