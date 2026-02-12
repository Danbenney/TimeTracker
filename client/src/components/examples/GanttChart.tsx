import { useState } from "react";
import GanttChart from "../GanttChart";

export default function GanttChartExample() {
  const [projects, setProjects] = useState([
    {
      id: "1",
      name: "Website Redesign",
      startDate: "2025-01-15",
      endDate: "2025-03-30",
      color: "#3b82f6",
      tasks: [
        {
          id: "1",
          name: "Research & Planning",
          startDate: "2025-01-15",
          endDate: "2025-01-30",
          gapDays: 0,
        },
        {
          id: "2",
          name: "Design Mockups",
          startDate: "2025-02-05",
          endDate: "2025-02-20",
          gapDays: 5,
        },
      ],
    },
    {
      id: "2",
      name: "Mobile App",
      startDate: "2025-02-01",
      endDate: "2025-04-15",
      color: "#8b5cf6",
      tasks: [
        {
          id: "3",
          name: "Setup & Architecture",
          startDate: "2025-02-01",
          endDate: "2025-02-15",
          gapDays: 0,
        },
      ],
    },
  ]);

  const handleUpdateProject = (id: string, updates: { startDate?: string; endDate?: string }) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const handleUpdateTask = (taskId: string, updates: { startDate?: string; endDate?: string }) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      tasks: project.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    })));
  };

  return (
    <div className="p-4">
      <GanttChart 
        projects={projects}
        onUpdateProject={handleUpdateProject}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
}
