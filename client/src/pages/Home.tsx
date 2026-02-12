import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Archive, ArchiveRestore, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProjectCard from "@/components/ProjectCard";
import ProjectForm from "@/components/ProjectForm";
import TaskForm from "@/components/TaskForm";
import GanttChart from "@/components/GanttChart";
import EmptyState from "@/components/EmptyState";
import CapacitySettings from "@/components/CapacitySettings";
import { type Holiday } from "@shared/schema";
import { differenceInDays } from "date-fns";

export type ViewMode = "day" | "week" | "month" | "year";

interface Task {
  id: string;
  projectId: string;
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
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Website Redesign",
      startDate: "2025-01-15",
      endDate: "2025-03-30",
      color: "#3b82f6",
      notes: "Redesign the company website with modern UI/UX principles",
      archived: false,
    },
    {
      id: "2",
      name: "Mobile App Development",
      startDate: "2025-02-01",
      endDate: "2025-05-15",
      color: "#8b5cf6",
      notes: "",
      archived: false,
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      projectId: "1",
      name: "Research & Planning",
      startDate: "2025-01-15",
      endDate: "2025-01-30",
      gapDays: 0,
      archived: false,
    },
    {
      id: "2",
      projectId: "1",
      name: "Design Mockups",
      startDate: "2025-02-05",
      endDate: "2025-02-20",
      gapDays: 5,
      archived: false,
    },
    {
      id: "3",
      projectId: "1",
      name: "Development",
      startDate: "2025-02-25",
      endDate: "2025-03-20",
      gapDays: 3,
      archived: false,
    },
    {
      id: "4",
      projectId: "2",
      name: "Setup & Architecture",
      startDate: "2025-02-01",
      endDate: "2025-02-15",
      gapDays: 0,
      archived: false,
    },
    {
      id: "5",
      projectId: "2",
      name: "Core Features",
      startDate: "2025-02-20",
      endDate: "2025-04-10",
      gapDays: 3,
      archived: false,
    },
  ]);

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("timeline");
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    hoursPerDay: 8,
    daysPerWeek: 5,
    holidays: [] as Holiday[],
  });

  const [projectListTab, setProjectListTab] = useState<"active" | "archived">("active");

  const projectsWithTasks = projects.map((project) => ({
    ...project,
    tasks: tasks.filter((task) => task.projectId === project.id),
  }));

  const activeProjectsWithTasks = projectsWithTasks.filter(p => !p.archived);
  const archivedProjectsWithTasks = projectsWithTasks.filter(p => p.archived);

  const handleAddProject = () => {
    setEditingProject(null);
    setProjectDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectDialogOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId));
    setTasks(tasks.filter((t) => t.projectId !== projectId));
  };

  const handleSubmitProject = (data: Omit<Project, "id" | "archived">) => {
    if (editingProject) {
      setProjects(
        projects.map((p) =>
          p.id === editingProject.id ? { ...data, id: p.id, archived: p.archived } : p
        )
      );
    } else {
      setProjects([...projects, { ...data, id: Date.now().toString(), archived: false }]);
    }
    setProjectDialogOpen(false);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setTaskDialogOpen(true);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleSubmitTask = (data: Omit<Task, "id" | "archived">) => {
    if (editingTask) {
      setTasks(
        tasks.map((t) => (t.id === editingTask.id ? { ...data, id: t.id, archived: t.archived } : t))
      );
    } else {
      setTasks([...tasks, { ...data, id: Date.now().toString(), archived: false }]);
    }
    setTaskDialogOpen(false);
  };

  const handleArchiveTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, archived: !t.archived } : t
    ));
    setTaskDialogOpen(false);
  };

  const handleUpdateProject = (id: string, updates: { startDate?: string; endDate?: string }) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const handleUpdateTask = (taskId: string, updates: { startDate?: string; endDate?: string }) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleArchiveProject = (projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, archived: !p.archived } : p
    ));
  };

  const handleExportProject = (project: Project) => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    
    let exportText = `PROJECT EXPORT\n`;
    exportText += `${'='.repeat(50)}\n\n`;
    
    exportText += `Project Title: ${project.name}\n`;
    exportText += `Status: ${project.archived ? 'Archived' : 'Active'}\n\n`;
    
    exportText += `Timeline:\n`;
    exportText += `  Start Date: ${new Date(project.startDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}\n`;
    exportText += `  End Date: ${new Date(project.endDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}\n\n`;
    
    if (project.notes && project.notes.trim()) {
      exportText += `Notes:\n`;
      exportText += `${project.notes}\n\n`;
    }
    
    exportText += `Tasks (${projectTasks.length}):\n`;
    exportText += `${'-'.repeat(50)}\n`;
    
    if (projectTasks.length === 0) {
      exportText += `  No tasks\n`;
    } else {
      projectTasks.forEach((task, index) => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        const durationDays = differenceInDays(taskEnd, taskStart) + 1;
        
        exportText += `\n${index + 1}. ${task.name}\n`;
        exportText += `   Start: ${taskStart.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}\n`;
        exportText += `   End: ${taskEnd.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}\n`;
        exportText += `   Duration: ${durationDays} day${durationDays !== 1 ? 's' : ''}\n`;
        if (task.gapDays > 0) {
          exportText += `   Gap Before Task: ${task.gapDays} day${task.gapDays > 1 ? 's' : ''}\n`;
        }
        if (task.archived) {
          exportText += `   Status: Archived\n`;
        }
      });
    }
    
    exportText += `\n${'='.repeat(50)}\n`;
    exportText += `Exported on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n`;
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_export.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmitSettings = (data: { hoursPerDay: number; daysPerWeek: number; holidays: Holiday[] }) => {
    setSettings(data);
    setSettingsOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-app-title">
                TimeTracker
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Project timeline management
              </p>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-sm text-muted-foreground hover-elevate active-elevate-2 px-3 py-1.5 rounded-md transition-colors"
              data-testid="button-capacity-settings"
            >
              <span className="font-medium">Capacity:</span> {settings.hoursPerDay} hrs/day • {settings.daysPerWeek} days/week
            </button>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddTask} variant="secondary" data-testid="button-add-task">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
            <Button onClick={handleAddProject} data-testid="button-add-project">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-border px-6">
            <TabsList>
              <TabsTrigger value="timeline" data-testid="tab-timeline">
                Gantt Timeline
              </TabsTrigger>
              <TabsTrigger value="projects" data-testid="tab-projects">
                Projects List
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="timeline" className="flex-1 overflow-hidden m-0">
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
              <h2 className="text-lg font-medium">Timeline View</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">View by:</span>
                <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                  <SelectTrigger className="w-32" data-testid="select-view-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ScrollArea className="h-full">
              <div className="p-6">
                <GanttChart 
                  projects={activeProjectsWithTasks}
                  onUpdateProject={handleUpdateProject}
                  onUpdateTask={handleUpdateTask}
                  viewMode={viewMode}
                  collapsedProjects={collapsedProjects}
                  onToggleCollapse={(projectId) => {
                    setCollapsedProjects(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(projectId)) {
                        newSet.delete(projectId);
                      } else {
                        newSet.add(projectId);
                      }
                      return newSet;
                    });
                  }}
                  onProjectClick={(project) => {
                    setSelectedProject(project);
                    setProjectDetailsOpen(true);
                  }}
                  onTaskClick={(task) => {
                    handleEditTask(task.id);
                  }}
                  holidays={settings.holidays}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="projects" className="flex-1 overflow-hidden m-0">
            <Tabs value={projectListTab} onValueChange={(value) => setProjectListTab(value as "active" | "archived")} className="h-full flex flex-col">
              <div className="border-b border-border px-6">
                <TabsList>
                  <TabsTrigger value="active" data-testid="tab-active-projects">
                    Active
                  </TabsTrigger>
                  <TabsTrigger value="archived" data-testid="tab-archived-projects">
                    Archived
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="active" className="flex-1 overflow-hidden m-0 p-6">
                <ScrollArea className="h-full">
                  {activeProjectsWithTasks.length === 0 ? (
                    <EmptyState onAddProject={handleAddProject} />
                  ) : (
                    <div className="space-y-4 max-w-4xl">
                      {activeProjectsWithTasks.map((project) => (
                        <ProjectCard
                          key={project.id}
                          {...project}
                          onEdit={() => handleEditProject(project)}
                          onDelete={() => handleDeleteProject(project.id)}
                          onEditTask={handleEditTask}
                          onDeleteTask={handleDeleteTask}
                          onArchive={() => handleArchiveProject(project.id)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="archived" className="flex-1 overflow-hidden m-0 p-6">
                <ScrollArea className="h-full">
                  {archivedProjectsWithTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No archived projects</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-4xl">
                      {archivedProjectsWithTasks.map((project) => (
                        <ProjectCard
                          key={project.id}
                          {...project}
                          onEdit={() => handleEditProject(project)}
                          onDelete={() => handleDeleteProject(project.id)}
                          onEditTask={handleEditTask}
                          onDeleteTask={handleDeleteTask}
                          onArchive={() => handleArchiveProject(project.id)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="dialog-project">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "Add New Project"}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm
            initialData={editingProject || undefined}
            onSubmit={handleSubmitProject}
            onCancel={() => setProjectDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="dialog-task">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Task" : "Add New Task"}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            projects={projects}
            initialData={editingTask || undefined}
            onSubmit={handleSubmitTask}
            onCancel={() => setTaskDialogOpen(false)}
            onArchive={editingTask ? () => handleArchiveTask(editingTask.id) : undefined}
            archived={editingTask?.archived || false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={projectDetailsOpen} onOpenChange={setProjectDetailsOpen}>
        <DialogContent className="max-w-lg" data-testid="dialog-project-details">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Project Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="font-medium">{new Date(selectedProject.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasks:</span>
                    <span className="font-medium">{tasks.filter(t => t.projectId === selectedProject.id && !t.archived).length}</span>
                  </div>
                </div>
              </div>
              {selectedProject.notes && selectedProject.notes.trim() && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                  <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                    {selectedProject.notes}
                  </p>
                </div>
              )}
              <div className="flex justify-between items-center gap-2 pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleExportProject(selectedProject)}
                    data-testid="button-export-project-details"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleArchiveProject(selectedProject.id);
                      setSelectedProject(prev => prev ? { ...prev, archived: !prev.archived } : null);
                      setProjectDetailsOpen(false);
                    }}
                    data-testid="button-archive-project-details"
                  >
                    {selectedProject.archived ? (
                      <>
                        <ArchiveRestore className="h-4 w-4 mr-2" />
                        Unarchive
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setProjectDetailsOpen(false);
                      handleEditProject(selectedProject);
                    }}
                    data-testid="button-edit-project-details"
                  >
                    Edit Project
                  </Button>
                  <Button
                    onClick={() => setProjectDetailsOpen(false)}
                    data-testid="button-close-project-details"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg" data-testid="dialog-settings">
          <DialogHeader>
            <DialogTitle>Capacity Settings</DialogTitle>
          </DialogHeader>
          <CapacitySettings
            initialData={settings}
            onSubmit={handleSubmitSettings}
            onCancel={() => setSettingsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
