import type { ReactNode } from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon } from "lucide-react";
import { cn } from "cn";

type ToastType = "success" | "error" | "info";

// React 트리 밖(mutation 콜백 등)에서도 띄울 수 있게 전역 매니저 하나를 공유
const toastManager = ToastPrimitive.createToastManager();

const show = (type: ToastType) => (message: string, timeout?: number) =>
  toastManager.add({ type, description: message, timeout });

/**
 * @example
 * toast.success("추천했습니다");
 * toast.error("이미 추천한 글입니다");
 */
export const toast = {
  success: show("success"),
  error: show("error"),
  info: show("info"),
};

const icons: Record<ToastType, ReactNode> = {
  success: <CircleCheckIcon className="text-green-600 dark:text-green-400" />,
  error: <CircleAlertIcon className="text-destructive" />,
  info: <InfoIcon className="text-blue-600 dark:text-blue-400" />,
};

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map(t => (
    <ToastPrimitive.Root
      key={t.id}
      toast={t}
      className={cn(
        "absolute inset-x-0 bottom-0 mx-auto w-fit max-w-full",
        "z-[calc(1000-var(--toast-index))]",
        // 최신 토스트가 맨 아래, 이전 것들은 위로 쌓임
        "transform-[translateY(calc(var(--toast-offset-y)*-1-var(--toast-index)*0.5rem))]",
        "[transition:transform_0.4s_cubic-bezier(0.22,1,0.36,1),opacity_0.3s]",
        "data-starting-style:transform-[translateY(100%)] data-starting-style:opacity-0",
        "data-ending-style:opacity-0 data-limited:opacity-0",
      )}>
      <ToastPrimitive.Content className="flex items-center gap-2 rounded-full bg-popover py-2 pr-4 pl-3 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 [&_svg]:size-4 [&_svg]:shrink-0">
        {icons[(t.type as ToastType) ?? "info"]}
        <ToastPrimitive.Description className="break-keep" />
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  ));
}

/**
 * 토스트 렌더러. 앱에 한 번만 둔다.
 * container에 shadow root 안의 요소를 넘겨야 Tailwind 스타일과 .dark가 적용됨
 */
export function Toaster({ container }: { container: HTMLElement }) {
  return (
    <ToastPrimitive.Provider
      toastManager={toastManager}
      limit={3}
      timeout={2500}>
      <ToastPrimitive.Portal container={container}>
        {/* pointer-events-none: 모달 Dialog가 열려 있을 때 토스트를 누르면
            "바깥 클릭"으로 처리돼 미리보기가 닫히므로 아예 클릭을 받지 않음 */}
        <ToastPrimitive.Viewport className="pointer-events-none fixed bottom-8 left-1/2 z-60 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
