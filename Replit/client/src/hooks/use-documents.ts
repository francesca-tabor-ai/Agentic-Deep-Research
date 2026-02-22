import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDocuments(search?: string) {
  return useQuery({
    queryKey: [api.documents.list.path, search],
    queryFn: async () => {
      const url = new URL(api.documents.list.path, window.location.origin);
      if (search) {
        url.searchParams.set("search", search);
      }
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch documents");
      return api.documents.list.responses[200].parse(await res.json());
    },
  });
}
