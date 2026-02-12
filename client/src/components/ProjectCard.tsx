import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, ChevronDown, ChevronRight, Archive, ArchiveRestore } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  gapDays: number;
  archived: boolean;
}

interface ProjectCardProps {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  color: string;
  tasks: Task[];
  archived: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onArchive?: () => void;
}

export default function ProjectCard({
  name,
  startDate,
  endDate,
  color,
  tasks,
  archived,
  onEdit,
  onDelete,
  onEditTask,
  onDeleteTask,
  onArchive,
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showArchivedTasks, setShowArchivedTasks] = useState(false);
  
  const activeTasks = tasks.filter(task => !task.archived);
  const archivedTasks = tasks.filter(task => task.archived);

  return (
    <Card className="p-4 hover-elevate">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5 mt-0.5 flex-shrink-0"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid={`button-toggle-${name}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <h3 className="text-lg font-medium truncate" data-testid={`text-project-${name}`}>
                {name}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {activeTasks.length} {activeTasks.length === 1 ? "task" : "tasks"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(startDate), "MMM d, yyyy")} -{" "}
              {format(new Date(endDate), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={onEdit}
            data-testid={`button-edit-project-${name}`}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          {onArchive && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onArchive}
              data-testid={`button-archive-project-${name}`}
            >
              {archived ? (
                <ArchiveRestore className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            data-testid={`button-delete-project-${name}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {isExpanded && activeTasks.length > 0 && (
        <div className="mt-4 pl-7 space-y-2">
          {activeTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between gap-2 p-2 rounded-md hover-elevate"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" data-testid={`text-task-${task.name}`}>
                  {task.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(task.startDate), "MMM d")} -{" "}
                  {format(new Date(task.endDate), "MMM d")}
                  {task.gapDays > 0 && (
                    <span className="ml-2">
                      • {task.gapDays} day{task.gapDays > 1 ? "s" : ""} gap
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => onEditTask(task.id)}
                  data-testid={`button-edit-task-${task.name}`}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => onDeleteTask(task.id)}
                  data-testid={`button-delete-task-${task.name}`}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isExpanded && archivedTasks.length > 0 && (
        <div className="mt-4 pl-7">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowArchivedTasks(!showArchivedTasks)}
            className="mb-2 h-7 text-xs text-muted-foreground"
            data-testid={`button-toggle-archived-tasks-${name}`}
          >
            {showArchivedTasks ? (
              <ChevronDown className="h-3 w-3 mr-1" />
            ) : (
              <ChevronRight className="h-3 w-3 mr-1" />
            )}
            Archived Tasks ({archivedTasks.length})
          </Button>
          {showArchivedTasks && (
            <div className="space-y-2">
              {archivedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-2 p-2 rounded-md hover-elevate opacity-60"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-through" data-testid={`text-task-${task.name}`}>
                      {task.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(task.startDate), "MMM d")} -{" "}
                      {format(new Date(task.endDate), "MMM d")}
                      {task.gapDays > 0 && (
                        <span className="ml-2">
                          • {task.gapDays} day{task.gapDays > 1 ? "s" : ""} gap
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => onEditTask(task.id)}
                      data-testid={`button-edit-task-${task.name}`}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => onDeleteTask(task.id)}
                      data-testid={`button-delete-task-${task.name}`}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
