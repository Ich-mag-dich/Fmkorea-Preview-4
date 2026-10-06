import { useEffect, useState } from "react";
import { useStorageItem } from "@/hooks/use-storage-item";

/**
 * 슬라이더로 바꾸는 숫자 설정.
 * 드래그 중엔 화면(draft)만 바꾸고 놓을 때 저장 (sync 저장소는 분당 쓰기 횟수 제한이 있음)
 */
export function useSliderSetting(
  item: Parameters<typeof useStorageItem<number>>[0],
) {
  const [saved, save] = useStorageItem(item);
  const [draft, setDraft] = useState(saved);
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => setDraft(saved), [saved]);

  const commit = async (value: number) => {
    setDraft(value);
    await save(value);
    setJustSaved(true);
  };
  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 1500);
    return () => clearTimeout(timer);
  }, [justSaved]);

  return { draft, setDraft, commit, justSaved };
}
