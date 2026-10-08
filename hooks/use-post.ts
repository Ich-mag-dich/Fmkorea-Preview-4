import { useQuery } from "@tanstack/react-query";
import { fetchPost } from "@/lib/api/post";
import { previewStore } from "@/lib/preview-store";
import { queryKeys } from "./query-keys";

export const usePost = (href: string) =>
  useQuery({
    queryKey: queryKeys.post(href),
    queryFn: () => fetchPost(href, previewStore.getOpener() ?? undefined),
  });
