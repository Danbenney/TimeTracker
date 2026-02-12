import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddProject: () => void;
}

export default function EmptyState({ onAddProject }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Calendar className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Get started by creating your first project to track timelines and visualize your work
      </p>
      <Button onClick={onAddProject} data-testid="button-add-first-project">
        Add Your First Project
      </Button>
    </div>
  );
}
