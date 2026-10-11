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
  // true/false로 두면 "저장됨"이 떠 있는 동안 다시 저장해도 값이 그대로라 타이머가
  // 새로 시작되지 않음. 저장한 시각으로 둬서 저장할 때마다 1.5초를 다시 셈
  const [savedAt, setSavedAt] = useState(0);
  useEffect(() => setDraft(saved), [saved]);

  const commit = async (value: number) => {
    setDraft(value);
    await save(value);
    setSavedAt(Date.now());
  };
  useEffect(() => {
    if (!savedAt) return;
    const timer = setTimeout(() => setSavedAt(0), 1500);
    return () => clearTimeout(timer);
  }, [savedAt]);

  return { draft, setDraft, commit, justSaved: savedAt !== 0 };
}
