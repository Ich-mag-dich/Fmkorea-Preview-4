// Claude Code 훅 (PostToolUse, Edit|Write): Claude가 고친 파일 하나에만 Prettier를 돌린다.
// - 저장소 밖 파일(메모, 임시 폴더 등)은 건드리지 않음
// - .prettierignore에 있는 파일(테스트용 원본 페이지 등)과 Prettier가 모르는 형식은 Prettier가 알아서 건너뜀
// - 실패해도 Claude 작업을 막지 않음 (포맷은 커밋 전에 다시 확인하면 됨)
import { execFileSync } from "node:child_process";
import { join, relative, resolve, isAbsolute } from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

try {
  const { tool_input, tool_response } = JSON.parse(raw);
  const file = tool_response?.filePath ?? tool_input?.file_path;
  const rel = file && relative(root, resolve(file));
  if (rel && !rel.startsWith("..") && !isAbsolute(rel)) {
    execFileSync(
      process.execPath, // 지금 이 스크립트를 돌리는 node
      [
        join(root, "node_modules", "prettier", "bin", "prettier.cjs"),
        "--write",
        "--ignore-unknown",
        rel,
      ],
      { cwd: root, stdio: "ignore" },
    );
  }
} catch {
  // 포맷 실패는 무시
}
