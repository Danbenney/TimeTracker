import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachWeekOfInterval, startOfDay, startOfWeek, startOfYear, endOfDay, endOfWeek, endOfYear, eachDayOfInterval, eachMonthOfInterval, eachYearOfInterval } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type Holiday } from "@shared/schema";

export type ViewMode = "day" | "week" | "month" | "year";

interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  gapDays: number;
  archived: boolean;
}

interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  color: string;
  notes?: string;
  archived: boolean;
  tasks: Task[];
}

interface GanttChartProps {
  projects: Project[];
  onUpdateProject?: (id: string, updates: { startDate?: string; endDate?: string }) => void;
  onUpdateTask?: (id: string, updates: { startDate?: string; endDate?: string }) => void;
  viewMode?: ViewMode;
  collapsedProjects?: Set<string>;
  onToggleCollapse?: (projectId: string) => void;
  onProjectClick?: (project: Project) => void;
  onTaskClick?: (task: Task & { projectId: string }) => void;
  holidays?: Holiday[];
}

interface GanttRow {
  id: string;
  projectId?: string;
  label: string;
  startDate: Date;
  endDate: Date;
  color: string;
  type: "project" | "task";
  gapDays?: number;
  project?: Project;
  task?: Task & { projectId: string };
}

export default function GanttChart({ 
  projects, 
  onUpdateProject, 
  onUpdateTask,
  viewMode = "month",
  collapsedProjects = new Set(),
  onToggleCollapse,
  onProjectClick,
  onTaskClick,
  holidays = [],
}: GanttChartProps) {
  const [dragState, setDragState] = useState<{
    rowId: string;
    type: "project" | "task";
    edge: "left" | "right";
    startX: number;
    originalStart: Date;
    originalEnd: Date;
  } | null>(null);

  const [previewDates, setPreviewDates] = useState<{
    rowId: string;
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const ganttData = useMemo(() => {
    const rows: GanttRow[] = [];
    
    projects.forEach((project) => {
      rows.push({
        id: project.id,
        label: project.name,
        startDate: new Date(project.startDate),
        endDate: new Date(project.endDate),
        color: project.color,
        type: "project",
        project: project,
      });

      const isCollapsed = collapsedProjects.has(project.id);
      if (!isCollapsed) {
        project.tasks.filter(task => !task.archived).forEach((task) => {
          rows.push({
            id: task.id,
            projectId: project.id,
            label: task.name,
            startDate: new Date(task.startDate),
            endDate: new Date(task.endDate),
            color: project.color,
            type: "task",
            gapDays: task.gapDays,
            task: { ...task, projectId: project.id },
          });
        });
      }
    });

    return rows;
  }, [projects, collapsedProjects]);

  const { minDate, maxDate, totalDays, timeHeaders, monthHeaders, subMarkers } = useMemo(() => {
    if (ganttData.length === 0) {
      const today = new Date();
      return {
        minDate: startOfMonth(today),
        maxDate: endOfMonth(addDays(today, 90)),
        totalDays: 90,
        timeHeaders: [],
        monthHeaders: [],
        subMarkers: [],
      };
    }

    const allDates = ganttData.flatMap((row) => [row.startDate, row.endDate]);
    const min = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const max = new Date(Math.max(...allDates.map((d) => d.getTime())));
    
    let startDate: Date;
    let endDate: Date;
    let headers: { label: string; width: number }[] = [];
    let monthHdrs: { label: string; width: number }[] = [];
    let markers: { date: number; position: number }[] = [];

    switch (viewMode) {
      case "day": {
        startDate = startOfDay(min);
        endDate = endOfDay(addDays(max, 7));
        const days = differenceInDays(endDate, startDate);
        
        const dayIntervals = eachDayOfInterval({ start: startDate, end: endDate });
        headers = dayIntervals.map((day) => ({
          label: format(day, "d"),
          width: (1 / days) * 100,
        }));
        
        // Group days by month for the month header row
        const monthGroups = new Map<string, number>();
        dayIntervals.forEach((day) => {
          const monthKey = format(day, "MMMM yyyy");
          monthGroups.set(monthKey, (monthGroups.get(monthKey) || 0) + 1);
        });
        
        monthHdrs = Array.from(monthGroups.entries()).map(([month, count]) => ({
          label: month.split(' ')[0], // Just the month name
          width: (count / days) * 100,
        }));
        
        markers = dayIntervals.map((day) => {
          const dayOffset = differenceInDays(day, startDate);
          return {
            date: day.getTime(),
            position: (dayOffset / days) * 100,
          };
        });
        break;
      }
      
      case "week": {
        startDate = startOfWeek(min, { weekStartsOn: 1 });
        endDate = endOfWeek(addDays(max, 14), { weekStartsOn: 1 });
        const days = differenceInDays(endDate, startDate);
        
        const weeks = eachWeekOfInterval(
          { start: startDate, end: endDate },
          { weekStartsOn: 1 }
        );
        
        headers = weeks.map((week, idx) => {
          const weekEnd = idx < weeks.length - 1 ? addDays(weeks[idx + 1], -1) : endDate;
          const daysInWeek = differenceInDays(weekEnd, week) + 1;
          return {
            label: `Week ${format(week, "w")}`,
            width: (daysInWeek / days) * 100,
          };
        });
        
        markers = weeks.map((week) => {
          const dayOffset = differenceInDays(week, startDate);
          return {
            date: week.getTime(),
            position: (dayOffset / days) * 100,
          };
        });
        break;
      }
      
      case "year": {
        startDate = startOfYear(min);
        endDate = endOfYear(addDays(max, 365));
        const days = differenceInDays(endDate, startDate);
        
        const years = eachYearOfInterval({ start: startDate, end: endDate });
        headers = years.map((year) => {
          const yearEnd = endOfYear(year);
          const daysInYear = differenceInDays(
            yearEnd > endDate ? endDate : yearEnd,
            year
          ) + 1;
          return {
            label: format(year, "yyyy"),
            width: (daysInYear / days) * 100,
          };
        });
        
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        markers = months.map((month) => {
          const dayOffset = differenceInDays(month, startDate);
          return {
            date: month.getTime(),
            position: (dayOffset / days) * 100,
          };
        });
        break;
      }
      
      case "month":
      default: {
        startDate = startOfMonth(min);
        endDate = endOfMonth(addDays(max, 30));
        const days = differenceInDays(endDate, startDate);
        
        const months: { label: string; width: number }[] = [];
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const monthEnd = endOfMonth(currentDate);
          const daysInMonth = differenceInDays(
            monthEnd > endDate ? endDate : monthEnd,
            currentDate
          ) + 1;
          
          months.push({
            label: format(currentDate, "MMM yyyy"),
            width: (daysInMonth / days) * 100,
          });
          
          currentDate = addDays(monthEnd, 1);
        }
        headers = months;
        
        const weeks = eachWeekOfInterval(
          { start: startDate, end: endDate },
          { weekStartsOn: 1 }
        );
        
        markers = weeks.map((weekStart) => {
          const dayOffset = differenceInDays(weekStart, startDate);
          return {
            date: weekStart.getTime(),
            position: (dayOffset / days) * 100,
          };
        });
        break;
      }
    }

    return {
      minDate: startDate,
      maxDate: endDate,
      totalDays: differenceInDays(endDate, startDate),
      timeHeaders: headers,
      monthHeaders: monthHdrs,
      subMarkers: markers,
    };
  }, [ganttData, viewMode]);

  const holidayColumns = useMemo(() => {
    if (!holidays || holidays.length === 0) return [];
    
    const columns: { date: string; left: number; width: number }[] = [];
    
    holidays.forEach(holiday => {
      const holidayStart = startOfDay(new Date(holiday.startDate + 'T00:00:00'));
      const holidayEnd = startOfDay(new Date(holiday.endDate + 'T00:00:00'));
      
      const daysInRange = eachDayOfInterval({ start: holidayStart, end: holidayEnd });
      
      daysInRange.forEach(day => {
        if (day < minDate || day > maxDate) {
          return;
        }
        
        const dayOffset = differenceInDays(day, minDate);
        const calculatedWidth = (1 / totalDays) * 100;
        const minWidth = 0.3;
        
        columns.push({
          date: format(day, 'yyyy-MM-dd'),
          left: (dayOffset / totalDays) * 100,
          width: Math.max(calculatedWidth, minWidth),
        });
      });
    });
    
    return columns;
  }, [holidays, minDate, maxDate, totalDays]);

  const getBarPosition = (startDate: Date, endDate: Date) => {
    const start = differenceInDays(startDate, minDate);
    const duration = differenceInDays(endDate, startDate) + 1;
    
    return {
      left: `${(start / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
    };
  };

  const handleMouseDown = useCallback((
    e: React.MouseEvent,
    row: GanttRow,
    edge: "left" | "right"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    setDragState({
      rowId: row.id,
      type: row.type,
      edge,
      startX: e.clientX,
      originalStart: row.startDate,
      originalEnd: row.endDate,
    });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragState.startX;
    
    if (Math.abs(deltaX) > 3) {
      setIsDragging(true);
    }
    
    const deltaDays = Math.round((deltaX / rect.width) * totalDays);

    let newStart = dragState.originalStart;
    let newEnd = dragState.originalEnd;

    if (dragState.edge === "left") {
      newStart = addDays(dragState.originalStart, deltaDays);
      if (newStart >= dragState.originalEnd) {
        newStart = addDays(dragState.originalEnd, -1);
      }
    } else {
      newEnd = addDays(dragState.originalEnd, deltaDays);
      if (newEnd <= dragState.originalStart) {
        newEnd = addDays(dragState.originalStart, 1);
      }
    }

    setPreviewDates({
      rowId: dragState.rowId,
      startDate: newStart,
      endDate: newEnd,
    });
  }, [dragState, totalDays]);

  const handleMouseUp = useCallback(() => {
    if (dragState && previewDates) {
      const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

      if (dragState.type === "project" && onUpdateProject) {
        onUpdateProject(dragState.rowId, {
          startDate: formatDate(previewDates.startDate),
          endDate: formatDate(previewDates.endDate),
        });
      } else if (dragState.type === "task" && onUpdateTask) {
        onUpdateTask(dragState.rowId, {
          startDate: formatDate(previewDates.startDate),
          endDate: formatDate(previewDates.endDate),
        });
      }
    }
    
    setDragState(null);
    setPreviewDates(null);
    setTimeout(() => setIsDragging(false), 0);
  }, [dragState, previewDates, onUpdateProject, onUpdateTask]);

  useEffect(() => {
    if (dragState) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No projects yet</p>
          <p className="text-sm mt-1">Add a project to see the timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto" data-testid="gantt-chart">
      <div className="min-w-[800px]">
        <div className="flex border-b border-border">
          <div className="w-64 flex-shrink-0 p-2 font-medium text-sm border-r border-border">
            Project / Task
          </div>
          <div className="flex-1">
            {monthHeaders.length > 0 && (
              <div className="flex border-b border-border">
                {monthHeaders.map((header, idx) => (
                  <div
                    key={idx}
                    className="text-sm font-medium p-2 border-r border-border text-center"
                    style={{ width: `${header.width}%` }}
                  >
                    {header.label}
                  </div>
                ))}
              </div>
            )}
            <div className="flex">
              {timeHeaders.map((header, idx) => (
                <div
                  key={idx}
                  className="text-sm font-medium p-2 border-r border-border text-center"
                  style={{ width: `${header.width}%` }}
                >
                  {header.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1 py-2" ref={timelineRef}>
          {ganttData.map((row) => {
            const isBeingDragged = previewDates?.rowId === row.id;
            const displayStart = isBeingDragged ? previewDates.startDate : row.startDate;
            const displayEnd = isBeingDragged ? previewDates.endDate : row.endDate;

            const isCollapsed = row.type === "project" && collapsedProjects.has(row.id);
            const hasTask = row.type === "project" && row.project && row.project.tasks.length > 0;

            return (
              <div key={`${row.type}-${row.id}`} className="flex hover-elevate rounded">
                <div className="w-64 flex-shrink-0 p-2 text-sm border-r border-border flex items-center gap-1">
                  {row.type === "project" && hasTask && onToggleCollapse && (
                    <button
                      onClick={() => onToggleCollapse(row.id)}
                      className="flex-shrink-0 hover:bg-accent rounded p-0.5"
                      data-testid={`button-toggle-${row.id}`}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  {row.type === "task" && <div className="w-5 flex-shrink-0" />}
                  <span
                    className={
                      row.type === "project" ? "font-medium" : "text-muted-foreground"
                    }
                    data-testid={`gantt-row-${row.label.trim()}`}
                  >
                    {row.label}
                  </span>
                </div>
                <div className="flex-1 relative py-2 px-1">
                  {subMarkers.map((marker) => (
                    <div
                      key={`marker-${marker.date}`}
                      className="absolute top-0 bottom-0 w-px bg-border/40"
                      style={{ left: `${marker.position}%` }}
                    />
                  ))}
                  
                  {holidayColumns.map((holiday) => (
                    <div
                      key={`holiday-${holiday.date}`}
                      className="absolute top-0 bottom-0 bg-muted/60 pointer-events-none"
                      style={{ 
                        left: `${holiday.left}%`, 
                        width: `${holiday.width}%` 
                      }}
                      title={`Holiday: ${new Date(holiday.date + 'T00:00:00').toLocaleDateString()}`}
                    />
                  ))}

                  {row.gapDays && row.gapDays > 0 && (
                    <div
                      className="absolute h-1 bg-muted-foreground/30 rounded top-1/2 -translate-y-1/2"
                      style={{
                        left: getBarPosition(
                          addDays(displayStart, -row.gapDays),
                          addDays(displayStart, -1)
                        ).left,
                        width: getBarPosition(
                          addDays(displayStart, -row.gapDays),
                          addDays(displayStart, -1)
                        ).width,
                      }}
                      title={`${row.gapDays} day gap`}
                    />
                  )}
                  <div
                    className="absolute h-6 rounded-md flex items-center px-2 text-xs text-white font-medium shadow-sm top-1/2 -translate-y-1/2 overflow-visible group select-none cursor-pointer"
                    style={{
                      ...getBarPosition(displayStart, displayEnd),
                      backgroundColor: row.color,
                      opacity: row.type === "task" ? 0.7 : 1,
                    }}
                    title={`${row.label.trim()}: ${format(displayStart, "MMM d")} - ${format(displayEnd, "MMM d")}`}
                    data-testid={`gantt-bar-${row.label.trim()}`}
                    onClick={(e) => {
                      if (!isDragging) {
                        e.stopPropagation();
                        if (row.type === "project" && row.project && onProjectClick) {
                          onProjectClick(row.project);
                        } else if (row.type === "task" && row.task && onTaskClick) {
                          onTaskClick(row.task);
                        }
                      }
                    }}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/30 hover:bg-white/50 transition-opacity rounded-l-md"
                      onMouseDown={(e) => handleMouseDown(e, row, "left")}
                      data-testid={`gantt-resize-left-${row.label.trim()}`}
                    />
                    <span className="truncate pointer-events-none">{row.label.trim()}</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/30 hover:bg-white/50 transition-opacity rounded-r-md"
                      onMouseDown={(e) => handleMouseDown(e, row, "right")}
                      data-testid={`gantt-resize-right-${row.label.trim()}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
