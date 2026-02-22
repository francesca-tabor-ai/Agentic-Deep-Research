import { Link } from "wouter";
import { format } from "date-fns";
import { ArrowRight, Calendar, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import type { z } from "zod";
import type { api } from "@shared/routes";

type Task = z.infer<typeof api.tasks.list.responses[200]>[0];

export function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <StatusBadge status={task.status} />
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {format(new Date(task.createdAt), "MMM d, yyyy")}
          </span>
        </div>
        <CardTitle className="text-lg font-semibold line-clamp-2 mt-2 group-hover:text-primary transition-colors">
          {task.query}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {task.result 
            ? task.result.replace(/[#*`]/g, '').substring(0, 150) + "..." 
            : "Research in progress..."}
        </p>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link href={`/task/${task.id}`} className="w-full">
          <div className="flex items-center justify-between w-full p-2 -ml-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              View Report
            </span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </CardFooter>
    </Card>
  );
}
