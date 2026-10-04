#!/usr/bin/env bash
# 이전 버전 태그 이후의 커밋 메시지를 conventional commit 종류별로 묶어 릴리즈 노트(markdown)로 출력
# 사용: release-notes.sh <새 태그> [저장소 URL]
set -euo pipefail

tag="$1"
repo_url="${2:-}"

# HEAD에서 닿는 가장 최신 v* 태그 = 이전 릴리즈. 없으면 첫 릴리즈라 전체 이력
prev=$(git tag --merged HEAD --sort=-v:refname --list 'v*' | head -n1)
range="${prev:+$prev..}HEAD"

order=(feat fix perf refactor style docs other)
declare -A title=(
  [feat]="새 기능"
  [fix]="버그 수정"
  [perf]="성능"
  [refactor]="리팩터링"
  [style]="스타일"
  [docs]="문서"
  [other]="기타"
)
declare -A items=()

pattern='^([a-z]+)(\([^)]*\))?!?: (.+)$'
while IFS=$'\x1f' read -r subject hash; do
  [[ -z "$subject" ]] && continue
  if [[ "$subject" =~ $pattern ]]; then
    type="${BASH_REMATCH[1]}"
    message="${BASH_REMATCH[3]}"
  else
    type="other"
    message="$subject"
  fi
  [[ -v "title[$type]" ]] || type="other" # chore, ci 등은 기타로
  items[$type]+="- ${message} (${hash})"$'\n'
done < <(git log --no-merges --reverse --pretty=format:'%s%x1f%h' "$range"; echo)

echo "## 변경 사항"
echo
any=false
for type in "${order[@]}"; do
  [[ -z "${items[$type]:-}" ]] && continue
  any=true
  echo "### ${title[$type]}"
  echo
  printf '%s\n' "${items[$type]}"
done
$any || { echo "변경된 커밋이 없습니다."; echo; }

if [[ -n "$repo_url" ]]; then
  if [[ -n "$prev" ]]; then
    echo "**Full Changelog**: ${repo_url}/compare/${prev}...${tag}"
  else
    echo "**Full Changelog**: ${repo_url}/commits/${tag}"
  fi
fi
