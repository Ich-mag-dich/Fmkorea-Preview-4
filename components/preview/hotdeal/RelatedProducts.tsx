import { useState } from "react";
import { ImageOffIcon, ShoppingBagIcon } from "lucide-react";
import { useRelatedProducts } from "@/hooks/use-related-products";
import { cn } from "@/lib/utils";
import type { PostData } from "@/lib/types";
import RelatedSection from "./RelatedSection";

const MARKET: Record<string, { name: string; className: string }> = {
  coupang: { name: "쿠팡", className: "text-[#e52528] dark:text-red-400" },
  gmarket: { name: "G마켓", className: "text-[#00b14f] dark:text-green-400" },
};

/**
 * 상품 썸네일. 쿠팡 이미지(ads-partners.coupang.com)는 광고 차단기가 막는 경우가 많아서
 * 못 불러오면 흰 빈칸 대신 아이콘을 보여줌
 */
function ProductImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  const box = "size-14 shrink-0 rounded-md border";

  if (!src || failed) {
    return (
      <span
        className={cn(
          box,
          "flex items-center justify-center bg-muted text-muted-foreground/60",
        )}>
        <ImageOffIcon className="size-5" />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(box, "bg-white object-contain")}
    />
  );
}

/**
 * 핫딜 글 아래 "유사한 쿠팡/지마켓 상품".
 * 광고라서 불러오는 중이거나 실패하면 자리 없이 그냥 숨김
 */
function RelatedProducts({ post }: { post: PostData }) {
  const { data } = useRelatedProducts(post);

  return (
    <RelatedSection
      icon={<ShoppingBagIcon className="text-blue-600 dark:text-blue-400" />}
      title="유사한 쿠팡/지마켓 상품"
      items={data ?? []}
      getKey={item => item.url}
      renderItem={item => {
        const market = MARKET[item.type];
        return (
          <a
            href={item.url}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/60">
            <ProductImage src={item.image} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="line-clamp-2 font-medium">{item.title}</span>
              <span className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground tabular-nums">
                <b className="text-sm font-bold text-red-600 dark:text-red-400">
                  {item.price.toLocaleString("ko-KR")}원
                </b>
                {item.result?.isRocket && <span>로켓배송</span>}
                {item.result?.isFreeShipping && <span>무료배송</span>}
              </span>
            </span>
            {market && (
              <span
                className={cn(
                  "shrink-0 self-end text-xs font-bold",
                  market.className,
                )}>
                {market.name}
              </span>
            )}
          </a>
        );
      }}
    />
  );
}

export default RelatedProducts;
