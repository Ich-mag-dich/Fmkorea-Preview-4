import { useState, type ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** 접혀 있을 때 보이는 개수 (사이트와 같음) */
const INITIAL_COUNT = 3;

/**
 * 핫딜 글 아래 "유사한 ..." 목록 공통 틀.
 * 제목 줄 + 처음 3개 + "더 보기 (총 N개)"로 펼치기
 */
function RelatedSection<T>({
  icon,
  title,
  description,
  items,
  getKey,
  renderItem,
}: {
  /** 제목 앞 아이콘. 섹션끼리 한눈에 구분되게 */
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const shown = expanded ? items : items.slice(0, INITIAL_COUNT);

  return (
    <section className="mx-6 flex flex-col overflow-hidden rounded-lg border bg-card text-sm shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-b bg-muted px-4 py-2.5">
        <h3 className="flex items-center gap-1.5 font-semibold [&_svg]:size-4 [&_svg]:shrink-0">
          {icon}
          {title}
        </h3>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </header>

      <ul className="flex flex-col divide-y">
        {shown.map(item => (
          <li key={getKey(item)}>{renderItem(item)}</li>
        ))}
      </ul>

      {items.length > INITIAL_COUNT && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(prev => !prev)}
          className="flex items-center justify-center gap-1 border-t bg-muted/40 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          {expanded ? "접기" : `더 보기 (총 ${items.length}개)`}
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
      )}
    </section>
  );
}

export default RelatedSection;
