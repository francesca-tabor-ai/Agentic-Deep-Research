import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Clock, FileText, Brain } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    pending: {
      color: "bg-yellow-500/15 text-yellow-600 border-yellow-200 hover:bg-yellow-500/25",
      icon: Clock,
      label: "Pending"
    },
    planning: {
      color: "bg-blue-500/15 text-blue-600 border-blue-200 hover:bg-blue-500/25",
      icon: Brain,
      label: "Planning"
    },
    searching: {
      color: "bg-purple-500/15 text-purple-600 border-purple-200 hover:bg-purple-500/25",
      icon: Loader2,
      label: "Searching",
      animate: true
    },
    synthesizing: {
      color: "bg-indigo-500/15 text-indigo-600 border-indigo-200 hover:bg-indigo-500/25",
      icon: FileText,
      label: "Synthesizing",
      animate: true
    },
    completed: {
      color: "bg-green-500/15 text-green-600 border-green-200 hover:bg-green-500/25",
      icon: CheckCircle2,
      label: "Completed"
    },
    failed: {
      color: "bg-red-500/15 text-red-600 border-red-200 hover:bg-red-500/25",
      icon: AlertCircle,
      label: "Failed"
    }
  };

  const activeConfig = config[status as keyof typeof config] || config.pending;
  const Icon = activeConfig.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "pl-2 pr-3 py-1 gap-1.5 transition-colors border",
        activeConfig.color
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", activeConfig.animate && "animate-spin")} />
      {activeConfig.label}
    </Badge>
  );
}
