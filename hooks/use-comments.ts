import { fetchComments } from "@/lib/api/fmkorea-api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useComments = (href: string, page: number, enabled: boolean) =>
  useQuery({
    queryKey: ["comments", href, page],
    queryFn: () => fetchComments(href, page),
    enabled,
    placeholderData: keepPreviousData, // 로딩 중에도 이전 페이지를 보여서 깜빡임 방지
  });
