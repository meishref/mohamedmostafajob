import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface SortIconProps {
  field: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export function SortIcon({ field, sortBy, sortDirection }: SortIconProps) {
  if (sortBy !== field) {
    return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-50" />;
  }

  return sortDirection === "asc" ? (
    <ArrowUp className="ml-1 inline h-3 w-3" />
  ) : (
    <ArrowDown className="ml-1 inline h-3 w-3" />
  );
}
