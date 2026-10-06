import { describe, expect, test } from "vitest";
import { parsePost } from "@/lib/parser";
import {
  applyBetResult,
  parsePredictionPolls,
  removePredictionPolls,
} from "@/lib/prediction-poll";
import type { PredictionPoll, PredictionPollBetResult } from "@/lib/types";
import { loadPage, readFixture } from "./helpers";

describe("parsePredictionPolls", () => {
  test("마감 전: 선택지와 참여 입력칸", () => {
    const [poll] = parsePredictionPolls(loadPage("poll-open.html"));
    expect(poll).toMatchObject({
      pk: "97531",
      title:
        "국가대표 축구 친선경기 :: 미국 (-0.5) vs 캐나다 :: 10/7 09:00 경기",
      totalSum: 228041,
      totalCount: 165,
      bet: { min: 100, max: 107, initial: 100, myPoint: 107 },
      endMessage: null,
    });
    expect(poll!.options).toEqual([
      {
        value: "0",
        label: "미국 (-0.5)",
        sum: 153700,
        percent: 67,
        odds: "1.44",
        count: 107,
        myBet: null,
      },
      {
        value: "1",
        label: "캐나다",
        sum: 74341,
        percent: 33,
        odds: "2.97",
        count: 58,
        myBet: null,
      },
    ]);
    expect(poll!.notices).toHaveLength(3);
  });

  test("마감 후: 입력칸 없이 마감 안내", () => {
    const [poll] = parsePredictionPolls(loadPage("poll-closed.html"));
    expect(poll!.bet).toBeNull();
    expect(poll!.endMessage).toBe("참여 마감 되었습니다.");
    // 마감 안내는 notices에 섞이지 않음
    expect(poll!.notices).not.toContain("참여 마감 되었습니다.");
  });

  test("내가 참여한 선택지: 막대 안 .my를 내 참여로 읽고, 총합은 따로 읽음", () => {
    const [poll] = parsePredictionPolls(loadPage("poll-my-bet.html"));
    const [argentina, benin] = poll!.options;
    // .my가 막대 앞에 붙어 있어도 총합을 내 참여 값(100)으로 잘못 읽지 않아야 함
    expect(argentina).toMatchObject({
      sum: 1071650,
      myBet: { point: 100, exp: 149 },
    });
    expect(benin).toMatchObject({
      sum: 584761,
      myBet: { point: 201, exp: 552 },
    });
    // 정산 대기 같은 새 안내 문구도 notices로 들어옴
    expect(poll!.notices[0]).toBe("정산을 기다리고 있습니다.");
  });

  test("승부예측 없는 글", () => {
    expect(parsePredictionPolls(loadPage("post-normal.html"))).toEqual([]);
  });
});

test("removePredictionPolls: 본문에서 폼을 지움", () => {
  const doc = loadPage("poll-open.html");
  removePredictionPolls(doc);
  expect(doc.querySelector("form.fm-pp")).toBeNull();
});

test("parsePost: 승부예측은 읽어 두고 본문에서는 지움", () => {
  const post = parsePost(
    "https://www.fmkorea.com/10419512543",
    loadPage("poll-open.html"),
  );
  expect(post.predictionPolls).toHaveLength(1);
  expect(post.content).not.toContain("fm-pp");
});

describe("applyBetResult", () => {
  // bet-result.json은 다른 승부예측(97520, 밀워키 vs 샌디에이고)에 참여한 응답
  const before: PredictionPoll = {
    pk: "97520",
    title: "밀워키 vs 샌디에이고",
    totalSum: 0,
    totalCount: 0,
    options: [],
    bet: { min: 100, max: 112, initial: 100, myPoint: 112 },
    endMessage: null,
    notices: ["안내"],
  };
  const result: PredictionPollBetResult = JSON.parse(
    readFixture("bet-result.json"),
  );

  test("응답의 tpl로 선택지를 최신 값으로 바꿈", () => {
    const after = applyBetResult(before, result);
    expect(after.options).toEqual([
      {
        value: "0",
        label: "밀워키",
        sum: 739985,
        percent: 53,
        odds: "1.82",
        count: 111,
        myBet: null,
      },
      {
        value: "1",
        label: "샌디에이고",
        sum: 649445,
        percent: 47,
        odds: "2.07",
        count: 175,
        myBet: { point: 100, exp: 207 },
      },
    ]);
    expect(after.totalSum).toBe(739985 + 649445);
    expect(after.totalCount).toBe(111 + 175);
  });

  test("보유 잉여력과 최대 참여 잉여력을 줄임", () => {
    const after = applyBetResult(before, result);
    expect(after.bet).toEqual({
      min: 100,
      max: 12,
      initial: 100,
      myPoint: 12,
    });
  });

  test("나머지 값은 그대로", () => {
    const after = applyBetResult(before, result);
    expect(after.pk).toBe(before.pk);
    expect(after.notices).toEqual(before.notices);
  });

  test("tpl을 못 읽으면 선택지는 그대로 두고 잉여력만 바꿈", () => {
    const withOptions = parsePredictionPolls(loadPage("poll-open.html"))[0]!;
    const after = applyBetResult(withOptions, { ...result, tpl: "" });
    expect(after.options).toEqual(withOptions.options);
    expect(after.bet?.myPoint).toBe(12);
  });
});
