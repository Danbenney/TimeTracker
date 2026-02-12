import EmptyState from "../EmptyState";

export default function EmptyStateExample() {
  return (
    <div className="p-4">
      <EmptyState onAddProject={() => console.log("Add project")} />
    </div>
  );
}
