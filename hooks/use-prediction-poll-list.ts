import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchPredictionPollList } from "@/lib/api/fmkorea-api";

/** 참여 현황 한 페이지에 오는 인원 */
export const POLL_LIST_PAGE_SIZE = 100;

/** 승부예측 선택지 하나의 참여 현황 한 페이지 */
export const usePredictionPollList = (
  pk: string,
  option: string,
  page: number,
) =>
  useQuery({
    queryKey: ["prediction-poll-list", pk, option, page],
    // o_win은 선택지 값 + 1 (사이트의 getPpListClick(pk, 1)이 선택지 0)
    queryFn: () =>
      fetchPredictionPollList(pk, String(Number(option) + 1), page),
    select: data => data.bet_all.o_list,
    // 페이지를 넘기는 동안 이전 페이지를 그대로 보여줌
    placeholderData: keepPreviousData,
    staleTime: 60_000, // 다시 펼칠 때마다 요청하지 않게
  });
