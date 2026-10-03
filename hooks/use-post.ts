import { useQuery } from "@tanstack/react-query";
import { fetchPost } from "@/lib/api/fmkorea-api";

export const usePost = (href: string) =>
  useQuery({
    queryKey: ["post", href],
    queryFn: () => fetchPost(href),
  });
