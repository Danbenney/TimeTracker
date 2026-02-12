import TaskForm from "../TaskForm";

export default function TaskFormExample() {
  const mockProjects = [
    { id: "1", name: "Website Redesign" },
    { id: "2", name: "Mobile App" },
  ];

  return (
    <div className="p-4 max-w-lg">
      <TaskForm
        projects={mockProjects}
        onSubmit={(data) => console.log("Submit:", data)}
        onCancel={() => console.log("Cancel")}
      />
    </div>
  );
}
