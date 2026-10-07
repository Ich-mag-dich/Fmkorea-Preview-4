import { Menu } from "@base-ui/react/menu";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { urls } from "@/lib/api/urls";
import { usePortalContainer } from "@/hooks/use-portal-container";
import { usePreviewPost } from "@/hooks/use-preview-post";
import { useQuery } from "@tanstack/react-query";
import { fetchBlindStatus } from "@/lib/api/member";
import { useBlindMember } from "@/hooks/use-blind-member";
import { queryKeys } from "@/hooks/query-keys";
import type { BlindType } from "@/lib/types";
import BlindDialog from "./BlindDialog";

const openTab = (url: string) => window.open(url, "_blank", "noopener");

/**
 * 작성자(children)를 누르면 쪽지/회원 정보/작성 글 메뉴를 띄움.
 * 요청에 필요한 게시판(mid)과 글 번호(docId)는 지금 보는 글에서 가져옴
 */
function AuthorMenu({
  memberSrl,
  className,
  children,
}: {
  memberSrl: string;
  className?: string;
  children: ReactNode; // 작성자 이름(+아이콘)
}) {
  const { mid, docId } = usePreviewPost().post;
  const container = usePortalContainer();
  const [open, setOpen] = useState(false);

  const blindStatus = useQuery({
    queryKey: queryKeys.blindStatus(memberSrl),
    queryFn: () => fetchBlindStatus({ memberSrl, docId, mid }),
    enabled: open && !!memberSrl, // 메뉴를 열 때만 요청
    staleTime: 30_000, // 바로 다시 열면 재요청 안 함
  });
  const blind = useBlindMember({ memberSrl, docId, mid });
  // 닫히는 애니메이션 동안에도 대상 문구가 유지되도록 type은 open과 따로 보관
  const [blindDialog, setBlindDialog] = useState<{
    open: boolean;
    type: BlindType;
  }>({ open: false, type: "default" });

  // 상태 확인 중이거나 요청 중이면 비활성. 조회가 끝났는데 항목이 없으면(비로그인) 숨김
  const blindItem = (type: BlindType, label: string) => {
    if (blindStatus.isPending || blind.isPending) {
      return [{ icon: urls.blindIcon, label: `${label} …` }];
    }
    // 요청/파싱 실패를 비로그인(항목 없음)과 구분해서 보여줌
    if (blindStatus.isError) {
      return [{ icon: urls.blindIcon, label: `${label} (상태 확인 실패)` }];
    }
    const blinded = blindStatus.data?.[type];
    if (blinded === undefined) return [];
    return [
      {
        icon: urls.blindIcon,
        label: blinded ? `${label} 취소` : label,
        // 추가는 메모 입력창을 거치고, 해제는 바로 처리
        onSelect: () =>
          blinded ?
            blind.mutate({ type, mode: "cancel" })
          : setBlindDialog({ open: true, type }),
      },
    ];
  };

  const items: { icon: string; label: string; onSelect?: () => void }[] = [
    {
      icon: urls.messageIcon,
      label: "쪽지 보내기",
      onSelect: () =>
        window.open(
          urls.sendMessage(memberSrl),
          "popup",
          "width=500,height=500,scrollbars=yes",
        ),
    },
    {
      icon: urls.memberInfoIcon,
      label: "회원 정보 보기",
      onSelect: () => openTab(urls.memberInfo({ mid, memberSrl })),
    },
    {
      icon: urls.writtenIcon,
      label: "작성 글 보기",
      onSelect: () => openTab(urls.writtenArticles({ mid, memberSrl })),
    },
    ...blindItem("default", "블라인드(글,댓글)"),
    ...blindItem("message", "블라인드(쪽지)"),
  ];

  // 탈퇴 회원 등 member_srl이 없으면 메뉴 없이 이름만
  if (!memberSrl) return <span className={className}>{children}</span>;

  return (
    <>
      <Menu.Root open={open} onOpenChange={setOpen}>
        <Menu.Trigger
          className={cn(
            "cursor-pointer outline-none hover:underline focus-visible:underline",
            className,
          )}>
          {children}
        </Menu.Trigger>
        <Menu.Portal container={container}>
          {/* z-50: 같은 z-50인 Dialog보다 DOM상 뒤에 붙으므로 위에 뜸 */}
          <Menu.Positioner sideOffset={4} align="start" className="z-50">
            <Menu.Popup className="min-w-40 origin-(--transform-origin) rounded-md bg-popover p-1 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition-[opacity,scale] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
              {items.map(({ icon, label, onSelect }) => (
                <Menu.Item
                  key={label}
                  disabled={!onSelect}
                  onClick={onSelect}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 outline-none select-none data-highlighted:bg-muted data-disabled:cursor-default data-disabled:opacity-50">
                  <img src={icon} alt="" className="size-4 object-contain" />
                  {label}
                </Menu.Item>
              ))}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <BlindDialog
        open={blindDialog.open}
        type={blindDialog.type}
        pending={blind.isPending}
        onOpenChange={open => setBlindDialog(prev => ({ ...prev, open }))}
        onSubmit={memo =>
          blind.mutate(
            { type: blindDialog.type, mode: "add", memo },
            // 실패하면 창을 열어둬서 다시 시도할 수 있게
            {
              onSuccess: () =>
                setBlindDialog(prev => ({ ...prev, open: false })),
            },
          )
        }
      />
    </>
  );
}

export default AuthorMenu;
