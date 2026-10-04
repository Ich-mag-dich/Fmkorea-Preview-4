import { useEffect, useState } from "react";
import type { WxtStorageItem } from "wxt/utils/storage";

// 메타데이터 타입과 무관하게 받으려고 값 관련 메서드만 사용
type ValueItem<T> = Pick<
  WxtStorageItem<T, Record<string, never>>,
  "fallback" | "getValue" | "setValue" | "watch"
>;

/**
 * 확장 저장소 값을 React 상태처럼 사용.
 * 다른 곳(옵션 페이지 ↔ 미리보기)에서 바꿔도 watch로 바로 반영됨
 */
export const useStorageItem = <T>(item: ValueItem<T>) => {
  const [value, setValue] = useState<T>(item.fallback);

  useEffect(() => {
    let alive = true;
    item.getValue().then(v => alive && setValue(v));
    const unwatch = item.watch(v => setValue(v));
    return () => {
      alive = false;
      unwatch();
    };
  }, [item]);

  return [value, (next: T) => item.setValue(next)] as const;
};
