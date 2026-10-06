import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 댓글 입력창. 등록 요청은 부모가 하고, 성공하면 true를 돌려주면 입력이 비워짐.
 * 답글 입력에도 그대로 재사용
 */
function CommentForm({
  pending,
  title = "댓글 작성",
  placeholder = "해당 게시물이 불편하시면 뒤로가기 눌러주시길 바랍니다.\n회원 간의 불편함을 주는 댓글은 자제해주시고 따뜻한 댓글 부탁드립니다.\n게시물에 문제가 있다면 신고 또는 정중하게 이의 제기 해주시길 바랍니다.",
  autoFocus,
  className,
  onSubmit,
  onCancel,
}: {
  pending: boolean;
  title?: ReactNode;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onSubmit: (content: string) => Promise<boolean>;
  /** 있으면 취소 버튼 표시 (답글 입력창 닫기용) */
  onCancel?: () => void;
}) {
  const [content, setContent] = useState("");
  const canSubmit = content.trim() !== "" && !pending;

  const submit = async () => {
    if (!canSubmit) return;
    if (await onSubmit(content.trim())) setContent("");
  };

  return (
    <form
      className={cn("flex flex-col gap-2", className)}
      onSubmit={e => {
        e.preventDefault();
        submit();
      }}>
      <p className="text-md font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </p>
      <div className="flex flex-row gap-2">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => {
            // Ctrl/Cmd + Enter로 등록, 그냥 Enter는 줄바꿈
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              submit();
            }
            // 미리보기 Dialog까지 ESC가 전달돼 창이 닫히지 않게, 답글 입력창만 닫음
            if (e.key === "Escape" && onCancel) {
              e.stopPropagation();
              onCancel();
            }
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={3}
          className="field-sizing-content max-h-60 min-h-20 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
        {/* h-auto + self-stretch: size의 고정 높이(h-8)를 풀어서 textarea 높이만큼 늘어나게 */}
        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-auto self-stretch bg-blue-500 px-5 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500">
          {pending ? "등록 중…" : "등록"}
        </Button>
        {onCancel && (
          // 등록 버튼과 같은 크기의 테두리 버튼. 등록(파랑)보다 눈에 덜 띄게 글자는 흐리게
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-auto self-stretch px-5 text-muted-foreground hover:text-foreground">
            취소
          </Button>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="mr-auto text-xs text-muted-foreground">
          Ctrl + Enter로 등록
        </span>
      </div>
    </form>
  );
}

export default CommentForm;
