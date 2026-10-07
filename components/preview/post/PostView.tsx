import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { VoteType } from "@/lib/types";
import { usePreviewPost } from "@/hooks/use-preview-post";
import { useVotePost } from "@/hooks/use-vote-post";
import AuthorMenu from "../author/AuthorMenu";
import RichContent from "../content/RichContent";
import PredictPoll from "../poll/PredictPoll";
import RelatedHotdeals from "../hotdeal/RelatedHotdeals";
import RelatedProducts from "../hotdeal/RelatedProducts";
import BoardHistory from "./BoardHistory";

// 본문은 fmkorea가 준 HTML이라 Tailwind 클래스를 직접 못 붙이므로 하위 태그 선택자로 스타일링
const contentClassName = cn(
  "min-h-60 px-6 py-6 text-[15px] leading-relaxed break-words",
  // style="width:900px" 같은 고정 너비 요소가 창을 넘지 않게. img는 아래 규칙이 더 구체적이라 그쪽이 적용됨
  "[&_*]:max-w-full",
  "[&_p]:my-2",
  // href 없는 <a>(핫딜 종료 신고자 이름 등)는 링크가 아니므로 링크 모양을 주지 않음
  "[&_a[href]]:text-blue-600 [&_a[href]]:underline dark:[&_a[href]]:text-blue-400",
  "[&_img]:mx-auto [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-[min(600px,100%)] [&_img]:rounded-md",
  "[&_video]:mx-auto [&_video]:my-3 [&_video]:max-h-[480px] [&_video]:max-w-full",
  "[&_iframe]:max-w-full",
);

function PostView() {
  const { href, post } = usePreviewPost();
  const vote = useVotePost(href);
  const onVote = (type: VoteType) => vote.mutate({ post, type });

  return (
    <article className="flex flex-col">
      {/* pr-8: DialogContent 우상단 X 버튼과 겹치지 않게 */}
      <header className="flex flex-col gap-2 border-b pr-8 pb-4">
        <DialogTitle className="text-xl leading-snug font-bold">
          {post.title}
        </DialogTitle>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-center text-sm text-muted-foreground">
          <AuthorMenu
            memberSrl={post.authorMemberSrl}
            className="inline-flex items-center gap-1.5 text-foreground">
            {post.authorLevelIcon && (
              <img
                src={post.authorLevelIcon}
                alt=""
                className="size-6 object-contain"
              />
            )}
            {post.authorUserIcon && (
              <img
                src={post.authorUserIcon}
                alt=""
                className="size-6 object-contain"
              />
            )}
            {post.author}
          </AuthorMenu>
          <div className="flex gap-3">
            {post.date && <span>{post.date}</span>}
            {post.views && <span>{post.views}</span>}
          </div>
        </div>
      </header>

      <RichContent html={post.content} className={contentClassName} />
      {post.predictionPolls.length > 0 && (
        // 본문(contentClassName)과 같은 좌우 여백
        <div className="flex flex-col gap-4 px-6">
          {post.predictionPolls.map(poll => (
            <PredictPoll key={poll.pk} poll={poll} />
          ))}
        </div>
      )}
      {/* 사이트와 같은 순서: 본문 → 유사 핫딜 → 쿠팡/지마켓 상품 → 추천 */}
      {post.hotdeal && (
        <div className="flex flex-col gap-4 empty:hidden">
          <RelatedHotdeals items={post.hotdeal.relatedDeals} />
          <RelatedProducts post={post} />
        </div>
      )}

      <div className="flex items-center justify-center gap-3 py-6">
        <Button
          variant="outline"
          className="text-blue-600 dark:text-blue-400"
          onClick={() => onVote("up")}>
          <ThumbsUpIcon />
          추천
        </Button>
        <span className="min-w-12 text-center text-lg font-bold tabular-nums">
          {post.voteCount}
        </span>
        <Button
          variant="outline"
          className="text-red-700 dark:text-red-400"
          onClick={() => onVote("down")}>
          <ThumbsDownIcon />
          비추천
        </Button>
      </div>

      <BoardHistory post={post} />
    </article>
  );
}

export default PostView;
