/** 게시글: 글 페이지 받기, 추천/비추천 */
import { parseComment, parsePost } from "../parser";
import type { CommentData, PostData, VoteType } from "../types";
import { fetchPage, postAct, readJson } from "./request";
import type { VoteResult } from "./types";
import { toCanonicalPostUrl } from "./urls";

/**
 * 게시글 페이지를 받아 게시글과 첫 댓글 페이지를 파싱해서 반환
 *
 * @param url 게시글 URL (목록에서 누른 링크 그대로. 짧은 주소로 바꿔서 요청함)
 * @param referrer 미리보기를 연 페이지 주소. 미리보기 중엔 주소창이 이 글 주소라서 그대로 두면
 *   Referer가 요청하는 글 자신이 되는데, Chrome에서 사이트가 이런 요청을 432로 차단함
 *   (Firefox의 content script fetch는 확장 쪽 요청이라 이렇게 붙지 않음)
 */
export const fetchPost = async (
  url: string,
  referrer?: string,
): Promise<{
  PostData: PostData;
  CommentData: CommentData[];
  commentCount: number;
}> => {
  const postUrl = toCanonicalPostUrl(url);
  const doc = await fetchPage(postUrl, "게시글을 불러오지 못했습니다", {
    referrer,
  });

  // parsePost는 doc을 직접 수정하므로 읽기만 하는 파싱을 먼저 수행
  const { comments: CommentData, commentCount } = parseComment(doc);
  const PostData = parsePost(postUrl, doc);
  return { PostData, CommentData, commentCount };
};

/** 게시글 추천/비추천. 실패(이미 추천함 등)는 서버 message로 예외 */
export const voteDocument = async (
  post: PostData,
  type: VoteType,
): Promise<VoteResult> => {
  const act = type === "up" ? "procDocumentVoteUp" : "procDocumentVoteDown";
  const res = await postAct(
    act,
    {
      target_srl: post.docId,
      ...(post.voteRid && { rid: post.voteRid }),
      module: "document",
      act,
    },
    { referrer: post.url },
  );
  return readJson<VoteResult>(res, "추천하지 못했습니다");
};
