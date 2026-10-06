/**
 * 테스트용으로 저장한 페이지에서 로그인한 사람의 개인 정보를 지운다.
 * 저장소가 공개라서, 로그인한 채로 저장한 파일은 커밋 전에 꼭 한 번 돌린다.
 *
 *   bun run fixtures:sanitize
 *
 * 하는 일
 * - 회원번호(current_member_srl)를 가짜 번호로 바꿈
 * - 그 회원의 닉네임(작성자 표시, 참여 현황 응답)을 가짜 닉네임으로 바꿈
 * - 알림 웹소켓 접속 토큰을 0으로 바꿈
 * - 상단 알림 목록(누가 어떤 댓글을 달았는지)을 지움
 *
 * 같은 파일에 여러 번 돌려도 결과는 같다.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FAKE_MEMBER_SRL = "1000000001";
const FAKE_NICKNAME = "테스트유저";

const dir = import.meta.dirname;
const files = readdirSync(dir)
  .filter(name => name.endsWith(".html") || name.endsWith(".json"))
  .map(name => ({ name, path: join(dir, name) }));
const contents = new Map(
  files.map(f => [f.name, readFileSync(f.path, "utf8")]),
);

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 1. 로그인한 회원번호. 페이지마다 같으므로 처음 나오는 것을 씀
const memberSrls = new Set<string>();
for (const text of contents.values()) {
  const srl = text.match(/current_member_srl = (\d+)/)?.[1];
  if (srl && srl !== FAKE_MEMBER_SRL) memberSrls.add(srl);
}

// 2. 그 회원의 닉네임. 작성자 표시(<a class='member_번호 member_plate'>아이콘…닉네임</a>)와
//    참여 현황 응답({"member_srl": 번호, "nick_name": "…"})에서 찾음
const nicknames = new Set<string>();
for (const srl of memberSrls) {
  const plate = new RegExp(
    `class='member_${srl} member_plate'[^>]*>(?:<img[^>]*>)*([^<]+)</a>`,
    "g",
  );
  const json = new RegExp(
    `"member_srl":\\s*${srl},[^}]*?"nick_name":\\s*"([^"]+)"`,
    "g",
  );
  for (const text of contents.values()) {
    for (const m of text.matchAll(plate)) nicknames.add(m[1]!.trim());
    for (const m of text.matchAll(json)) nicknames.add(m[1]!.trim());
  }
}
nicknames.delete(FAKE_NICKNAME);

for (const { name, path } of files) {
  let text = contents.get(name)!;
  const before = text;

  for (const srl of memberSrls) {
    // member_123 처럼 앞에 _가 붙기도 해서 \b 대신 앞뒤가 숫자가 아닌지만 봄
    text = text.replace(
      new RegExp(`(?<!\\d)${srl}(?!\\d)`, "g"),
      FAKE_MEMBER_SRL,
    );
  }
  // 닉네임은 글자 그대로 전부 바꿈. 다른 사람 글에 같은 글자가 있어도 테스트 데이터라 문제없음
  for (const nick of nicknames) {
    text = text.replace(new RegExp(escapeRegExp(nick), "g"), FAKE_NICKNAME);
  }
  // 알림 웹소켓 접속 토큰 ws.send('Z@<토큰>@<회원번호>')
  text = text.replace(/(ws\.send\('Z@)[0-9a-f]+(@)/g, `$1${"0".repeat(32)}$2`);
  // 상단 알림 목록의 항목들
  text = text.replace(
    /<li class="li li_\w+">(?:(?!<\/li>)[\s\S])*?procNcenterRedirect[\s\S]*?<\/li>/g,
    "",
  );

  if (text !== before) {
    writeFileSync(path, text);
    console.log(`정리함: ${name}`);
  }
}

console.log(
  `회원번호 ${memberSrls.size}개, 닉네임 ${nicknames.size}개를 가짜 값으로 바꿨습니다.`,
);
