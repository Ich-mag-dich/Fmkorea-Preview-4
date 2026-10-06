import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SavedBadge({ show }: { show: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-sm text-green-600 transition-opacity dark:text-green-400",
        !show && "opacity-0",
      )}>
      <CheckIcon className="size-3.5" />
      저장됨
    </span>
  );
}
