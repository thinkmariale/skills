#!/usr/bin/env bash
# Diff a local skill against the upstream it was forked from.
#
#   scripts/upstream-diff.sh <skill>            # vs the pinned upstream commit
#   scripts/upstream-diff.sh <skill> --latest   # vs upstream's current default branch
#   scripts/upstream-diff.sh <skill> --also     # use the metadata.also-from source instead
#
# The source comes from the skill's frontmatter:
#   metadata.source: "<owner>/<repo>@<commit>:<path>"
# Upstream repos are cloned once into ${XDG_CACHE_HOME:-~/.cache}/thinkmariale-skills/.
set -euo pipefail

skill="${1:?usage: upstream-diff.sh <skill> [--latest] [--also]}"
shift
latest=0; key="source"
for arg in "$@"; do
  case "$arg" in
    --latest) latest=1 ;;
    --also) key="also-from" ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

root="$(cd "$(dirname "$0")/.." && pwd)"
dir="$root/skills/$skill"
[[ -f "$dir/SKILL.md" ]] || { echo "no such skill: $skill" >&2; exit 1; }

src="$(sed -n "s/^  $key: \"\(.*\)\"$/\1/p" "$dir/SKILL.md" | head -1)"
[[ -n "$src" ]] || { echo "$skill has no metadata.$key (original skill?)" >&2; exit 1; }

repo="${src%%@*}"; rest="${src#*@}"; commit="${rest%%:*}"; path="${rest#*:}"
cache="${XDG_CACHE_HOME:-$HOME/.cache}/thinkmariale-skills/${repo//\//__}"
if [[ ! -d "$cache/.git" ]]; then
  git clone --quiet "https://github.com/$repo.git" "$cache"
else
  git -C "$cache" fetch --quiet origin
fi
ref="$commit"; [[ $latest -eq 1 ]] && ref="origin/HEAD"

tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
git -C "$cache" archive "$ref" "$path" | tar -x -C "$tmp"
upstream="$tmp/$path"
[[ -e "$upstream" ]] || { echo "$path not found upstream at $ref" >&2; exit 1; }

echo "# $skill vs $repo@$ref:$path"
# A single file (e.g. a converted command) diffs against SKILL.md; a directory diffs recursively.
if [[ -f "$upstream" ]]; then
  diff -u "$upstream" "$dir/SKILL.md" || true
else
  diff -ru "$upstream" "$dir" || true
fi
