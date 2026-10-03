export const getPreviewLink = (e: HTMLElement): HTMLAnchorElement | null => {
  const link = e.closest("a");
  if (
    link?.classList.contains("title") ||
    link?.classList.contains("hotdeal_var8") ||
    e.closest("td")?.classList.contains("title")
  ) {
    return link as HTMLAnchorElement;
  }
  return null;
};
