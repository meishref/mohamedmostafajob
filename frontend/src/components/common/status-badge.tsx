import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  name: string;
  color?: string | null;
}

export function StatusBadge({ name, color }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      style={color ? { borderColor: color, color } : undefined}
    >
      {name}
    </Badge>
  );
}
