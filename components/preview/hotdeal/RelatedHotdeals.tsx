import { FlameIcon } from "lucide-react";
import { openInPreview } from "@/lib/preview-store";
import type { RelatedHotdeal } from "@/lib/types";
import RelatedSection from "./RelatedSection";

/** 핫딜 글 아래 "유사한 최근 6개월 핫딜들". 누르면 미리보기 안에서 그 글로 이동 */
function RelatedHotdeals({ items }: { items: RelatedHotdeal[] }) {
  return (
    <RelatedSection
      icon={<FlameIcon className="text-orange-500" />}
      title="유사한 최근 6개월 핫딜"
      description="상품명과 비슷한 순서"
      items={items}
      getKey={item => item.url}
      renderItem={item => (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => openInPreview(e, item.url)}
          className="flex flex-col gap-0.5 px-4 py-2 transition-colors hover:bg-muted/60">
          <span className="truncate">
            {item.shop && (
              <span className="text-muted-foreground">[{item.shop}] </span>
            )}
            <span className="font-medium">{item.title}</span>
          </span>
          <span className="flex flex-wrap gap-x-3 text-xs text-muted-foreground tabular-nums">
            {item.price && (
              <span>
                가격{" "}
                <b className="font-semibold text-blue-600 dark:text-blue-400">
                  {item.price}
                </b>
              </span>
            )}
            {item.date && <span>등록일 {item.date}</span>}
          </span>
        </a>
      )}
    />
  );
}

export default RelatedHotdeals;
