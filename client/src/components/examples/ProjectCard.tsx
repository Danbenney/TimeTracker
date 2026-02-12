import ProjectCard from "../ProjectCard";

export default function ProjectCardExample() {
  return (
    <div className="p-4 max-w-2xl">
      <ProjectCard
        id="1"
        name="Website Redesign"
        startDate="2025-01-15"
        endDate="2025-03-30"
        color="#3b82f6"
        tasks={[
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
          {
            id: "3",
            name: "Development",
            startDate: "2025-02-25",
            endDate: "2025-03-20",
            gapDays: 3,
          },
        ]}
        onEdit={() => console.log("Edit project")}
        onDelete={() => console.log("Delete project")}
        onEditTask={(id) => console.log("Edit task", id)}
        onDeleteTask={(id) => console.log("Delete task", id)}
      />
    </div>
  );
}
