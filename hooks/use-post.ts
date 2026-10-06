import { useQuery } from "@tanstack/react-query";
import { fetchPost } from "@/lib/api/fmkorea-api";
import { queryKeys } from "./query-keys";

export const usePost = (href: string) =>
  useQuery({
    queryKey: queryKeys.post(href),
    queryFn: () => fetchPost(href),
  });
