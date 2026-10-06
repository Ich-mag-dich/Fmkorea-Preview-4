/** 승부예측: 참여 현황, 참여하기 */
import type {
  PostData,
  PredictionPollBetResult,
  PredictionPollList,
} from "../types";
import { postAct, readJson } from "./request";

/**
 * 승부예측 참여 현황 한 페이지
 *
 * @param pk 승부예측 번호
 * @param o_win 선택지 값 + 1 (선택지 0 → "1"). "0"이면 모든 선택지
 * @param page 페이지 (한 페이지에 100명)
 */
export const fetchPredictionPollList = async (
  pk: string,
  o_win: string,
  page = 1,
): Promise<PredictionPollList> => {
  const res = await postAct("getPpList", {
    pk,
    o_win,
    page: String(page),
    module: "pp",
    act: "getPpList",
  });
  return readJson<PredictionPollList>(
    res,
    "승부예측 목록을 불러오지 못했습니다",
  );
};

/**
 * 승부예측 참여하기
 *
 * @param post 승부예측이 있는 게시글 (referrer용)
 * @param pk 승부예측 번호
 * @param option 고른 선택지 값 (참여 현황의 o_win과 달리 +1 하지 않음)
 * @param bet 걸 잉여력
 */
export const betPredictionPoll = async (
  post: PostData,
  pk: string,
  option: string,
  bet: number,
): Promise<PredictionPollBetResult> => {
  const res = await postAct(
    "procPpBet",
    { pk, o: option, bet: String(bet), module: "pp", act: "procPpBet" },
    { referrer: post.url },
  );
  return readJson<PredictionPollBetResult>(
    res,
    "승부예측에 참여하지 못했습니다",
  );
};
