/** 이미지콘: 내가 가진 이미지콘 목록 */
import type { PostData } from "../types";
import { postAct, readJson } from "./request";
import type { ImageConFavoriteResult, ImageConsResponse } from "./types";

/**
 * 보유한 이미지콘 세트와 최근 사용·즐겨찾기 목록. 회원 정보라 로그인 쿠키가 필요함.
 * 사이트는 글 페이지에서 이미지콘 창을 열 때 보내므로 Referer도 그 글 주소로 맞춤
 */
export const fetchImageCons = async (post: PostData) => {
  const res = await postAct(
    "getMemberImagecons",
    { module: "imagecon", act: "getMemberImagecons" },
    { referrer: post.url },
  );
  return readJson<ImageConsResponse>(res, "이미지콘을 불러오지 못했습니다");
};

/** 이미지콘 즐겨찾기 등록(favorite: true)·해제. 응답에 바뀐 뒤의 즐겨찾기 목록이 옴 */
export const setImageConFavorite = async (
  post: PostData,
  { setSrl, sortOrder }: { setSrl: number; sortOrder: number },
  favorite: boolean,
) => {
  const act =
    favorite ? "procImageconAddFavorite" : "procImageconRemoveFavorite";
  const res = await postAct(
    act,
    {
      set_srl: String(setSrl),
      sort_order: String(sortOrder),
      module: "imagecon",
      act,
    },
    { referrer: post.url },
  );
  return readJson<ImageConFavoriteResult>(
    res,
    "즐겨찾기를 처리하지 못했습니다",
  );
};

/**
 * 이미지콘 댓글의 본문. 사이트(imagecon.js)는 이미지콘을 누르면 입력창을 이 글자 하나로
 * 바꿔 바로 등록한다. 글자와 섞어 보내지 않음 (글자가 있으면 이미지콘 버튼이 막힘)
 */
export const imageConContent = (setSrl: number, sortOrder: number) =>
  `[[imagecon:${setSrl}_${sortOrder}]]`;
