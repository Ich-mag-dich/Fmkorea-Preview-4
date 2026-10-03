import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import type { Declaration, Plugin } from "postcss";

// Shadow DOM 안의 @property는 브라우저가 등록하지 않아서 Tailwind v4의
// shadow/ring/transform 등 유틸리티가 초기값 없이 깨진다.
// @property의 initial-value를 일반 선언으로 풀어서 넣어준다.
const shadowDomPropertyFallback: Plugin = {
  postcssPlugin: "shadow-dom-property-fallback",
  OnceExit(root, { AtRule, Rule, Declaration }) {
    const inherited: Declaration[] = [];
    const nonInherited: Declaration[] = [];

    root.walkAtRules("property", (atRule) => {
      let initialValue: string | undefined;
      let inherits = false;
      atRule.walkDecls((decl) => {
        if (decl.prop === "initial-value") initialValue = decl.value;
        if (decl.prop === "inherits") inherits = decl.value.trim() === "true";
      });
      if (initialValue === undefined) return;

      const decl = new Declaration({ prop: atRule.params.trim(), value: initialValue });
      (inherits ? inherited : nonInherited).push(decl);
    });

    if (inherited.length === 0 && nonInherited.length === 0) return;

    const layer = new AtRule({ name: "layer", params: "properties" });
    if (inherited.length > 0) {
      layer.append(new Rule({ selector: ":host", nodes: inherited }));
    }
    if (nonInherited.length > 0) {
      layer.append(
        new Rule({ selector: ":host, *, ::before, ::after, ::backdrop", nodes: nonInherited }),
      );
    }
    root.append(layer);
  },
};

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
    css: {
      postcss: { plugins: [shadowDomPropertyFallback] },
    },
  }),
  manifest: {
    name: "Fmkorea preview - 에펨코리아 게시글 미리보기",
    permissions: ["storage"],
    host_permissions: ["https://www.fmkorea.com/*"],
  },
});
