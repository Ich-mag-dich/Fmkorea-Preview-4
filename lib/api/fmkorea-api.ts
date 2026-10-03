import { parseComment, parsePost } from "../parser";
import type { PostData } from "../types";
import { type CommentData } from "./../types";

/**
 * 주어진 URL의 게시글 데이터를 가져와 파싱하여 반환
 *
 * @param url 게시글 URL
 * @returns 게시글 데이터와 댓글 데이터를 포함한 객체
 */
export const fetchPost = async (
  url: string,
): Promise<{
  PostData: PostData;
  CommentData: CommentData[];
  commentCount: number;
}> => {
  const res = await fetch(url);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  // parsePost는 doc을 직접 수정하므로 읽기만 하는 파싱을 먼저 수행
  const { comments: CommentData, commentCount } = parseComment(doc);
  const PostData = parsePost(url, doc);
  return { PostData, CommentData, commentCount };
};
