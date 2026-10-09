import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { setImageConFavorite } from "@/lib/api/image-cons";
import type { ImageConsResponse } from "@/lib/api/types";
import type { PostData } from "@/lib/types";
import { queryKeys } from "./query-keys";

/** 이미지콘 즐겨찾기 등록·해제. 응답에 바뀐 즐겨찾기 전체가 와서 목록을 다시 받지 않고 그대로 넣음 */
export const useImageConFavorite = (post: PostData) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      con,
      favorite,
    }: {
      con: { setSrl: number; sortOrder: number };
      favorite: boolean;
    }) => setImageConFavorite(post, con, favorite),
    onSuccess: (res, { favorite }) => {
      queryClient.setQueryData<ImageConsResponse>(
        queryKeys.imageCons(),
        old =>
          old && { ...old, favorites: res.favorites, favorites_max: res.max },
      );
      toast.success(
        res.message
          || (favorite ? "즐겨찾기에 등록했습니다" : (
            "즐겨찾기에서 해제했습니다"
          )),
      );
    },
    onError: error => toast.error(error.message),
  });
};
