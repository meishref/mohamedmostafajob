export interface SearchResult {
  type: "employee" | "task" | "payment" | "expense";
  id: string;
  title: string;
  subtitle: string;
  status?: string | null;
  status_color?: string | null;
  url: string;
  created_at: string;
}

export interface GlobalSearchResponse {
  results: SearchResult[];
  total: number;
}
