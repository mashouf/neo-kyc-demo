import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function StepForm({ className, ...props }: ComponentProps<"form">) {
  return <form {...props} className={cn("space-y-6", className)} />;
}
