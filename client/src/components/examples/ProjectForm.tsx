import ProjectForm from "../ProjectForm";

export default function ProjectFormExample() {
  return (
    <div className="p-4 max-w-lg">
      <ProjectForm
        onSubmit={(data) => console.log("Submit:", data)}
        onCancel={() => console.log("Cancel")}
      />
    </div>
  );
}
