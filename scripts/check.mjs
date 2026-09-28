#!/usr/bin/env node
// Repo validator. No dependencies. Run: node scripts/check.mjs
// Exits 1 on any error; warnings are printed but don't fail.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";

const root = join(dirname(new URL(import.meta.url).pathname), "..");
const skillsDir = join(root, "skills");
const errors = [];
const warnings = [];
const err = (s, m) => errors.push(`${s}: ${m}`);
const warn = (s, m) => warnings.push(`${s}: ${m}`);

const HARD_MAX = 200; // any skill we merged or wrote
const SOFT_MAX = 150;
const MERGE_GROWTH = 25; // max body lines a merge may add over its upstream base
const STATUSES = ["verbatim", "modified", "merged", "original"];
// Skills dropped during consolidation, mapped to their replacement.
const DROPPED = {
  "test-driven-development": "tdd",
  "debugging-and-error-recovery": "diagnosing-bugs",
  "code-review-and-quality": "code-review",
  "spec-driven-development": "to-spec",
  "planning-and-task-breakdown": "to-tickets",
  "incremental-implementation": "implement",
  "interview-me": "grilling",
  "documentation-and-adrs": "domain-modeling",
  "using-agent-skills": "ask",
  "ask-matt": "ask",
  "setup-matt-pocock-skills": "setup-skills",
};
// Slash commands that are Claude Code built-ins, not skills in this repo.
const BUILTINS = new Set(["clear", "compact", "plugin", "loop", "help", "init", "config", "mcp", "agents"]);
// Backticked "/x" that are paths or deliberate counter-examples, not commands.
const NOT_COMMANDS = new Set(["tmp", "settings", "debug"]);

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fm = { metadata: {} };
  let inMeta = false;
  for (const line of m[1].split("\n")) {
    const nested = line.match(/^  ([\w-]+):\s*"?(.*?)"?$/);
    if (inMeta && nested) { fm.metadata[nested[1]] = nested[2]; continue; }
    const top = line.match(/^([\w-]+):\s*(.*)$/);
    if (!top) continue;
    inMeta = top[1] === "metadata";
    if (!inMeta) fm[top[1]] = top[2].replace(/^"(.*)"$/, "$1");
  }
  return { fm, bodyStart: m[0].length };
}

// Body line count without frontmatter or the attribution footer.
function bodyLines(text) {
  const parsed = parseFrontmatter(text);
  const body = parsed ? text.slice(parsed.bodyStart) : text;
  return body.replace(/\n+_(Adapted|Derived) from .*\(MIT\)\._\n*$/, "\n").trimEnd().split("\n").length;
}

function upstreamSkill(source) {
  const [repo, rest] = source.split("@");
  const [commit, path] = [rest.slice(0, rest.indexOf(":")), rest.slice(rest.indexOf(":") + 1)];
  const cache = join(process.env.XDG_CACHE_HOME || join(homedir(), ".cache"), "thinkmariale-skills", repo.replace("/", "__"));
  if (!existsSync(join(cache, ".git"))) return null;
  const file = path.endsWith(".md") ? path : `${path}/SKILL.md`;
  try {
    return execFileSync("git", ["-C", cache, "show", `${commit}:${file}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch { return null; }
}

// ---- marketplace ----
const market = JSON.parse(readFileSync(join(root, ".claude-plugin/marketplace.json"), "utf8"));
const bundleOf = {};
for (const plugin of market.plugins) {
  for (const p of plugin.skills) {
    const name = p.replace(/^\.\/skills\//, "");
    if (!existsSync(join(skillsDir, name, "SKILL.md"))) err(`marketplace/${plugin.name}`, `lists missing skill ${p}`);
    if (bundleOf[name]) err(name, `in two bundles: ${bundleOf[name]} and ${plugin.name}`);
    bundleOf[name] = plugin.name;
  }
}

// ---- skills ----
const skills = readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory());
const skillSet = new Set(skills);
let upstreamChecked = 0;

for (const name of skills) {
  const dir = join(skillsDir, name);
  const file = join(dir, "SKILL.md");
  if (!existsSync(file)) { err(name, "no SKILL.md"); continue; }
  const text = readFileSync(file, "utf8");
  const parsed = parseFrontmatter(text);
  if (!parsed) { err(name, "missing frontmatter"); continue; }
  const { fm } = parsed;

  if (fm.name !== name) err(name, `frontmatter name "${fm.name}" != directory`);
  if (!fm.description) err(name, "missing description");
  else if (fm.description.length > 1024) err(name, `description is ${fm.description.length} chars (max 1024)`);
  const status = fm.metadata.status;
  if (!STATUSES.includes(status)) err(name, `metadata.status "${status}" not one of ${STATUSES.join("/")}`);
  if (status !== "original" && !fm.metadata.source) err(name, "missing metadata.source");
  if (!bundleOf[name]) err(name, "not in any bundle in marketplace.json");

  // Size
  const lines = text.split("\n").length;
  const ours = status === "merged" || status === "original";
  if (lines > HARD_MAX) (ours ? err : warn)(name, `SKILL.md is ${lines} lines (max ${HARD_MAX})${ours ? "" : ", upstream size: trim candidate"}`);
  else if (lines > SOFT_MAX) warn(name, `SKILL.md is ${lines} lines (soft max ${SOFT_MAX})`);

  // Merge growth vs upstream base
  if (status === "merged") {
    const base = upstreamSkill(fm.metadata.source);
    if (base) {
      upstreamChecked++;
      const growth = bodyLines(text) - bodyLines(base);
      if (growth > MERGE_GROWTH) err(name, `merge grew the body by ${growth} lines (max ${MERGE_GROWTH})`);
    }
  }

  // Links: relative, one level deep, and present
  for (const [, target] of text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
    if (/^(https?:|mailto:)/.test(target) || !/[./]/.test(target)) continue; // URLs and template placeholders like (link)
    if (target.includes("..")) err(name, `link escapes the skill folder: ${target}`);
    else if (!existsSync(join(dir, target))) err(name, `broken link: ${target}`);
  }
  for (const [, ref] of text.matchAll(/`((?:references|personas|scripts)\/[\w./-]+)`/g)) {
    if (!existsSync(join(dir, ref))) err(name, `missing file: ${ref}`);
  }

  // References to other skills, across every markdown file in the skill
  const mdFiles = readdirSync(dir, { recursive: true }).filter((f) => f.endsWith(".md"));
  for (const rel of mdFiles) {
    // Attribution (frontmatter source lines, "Adapted/Derived from" footers) may name upstream skills.
    const body = readFileSync(join(dir, rel), "utf8")
      .replace(/^---\n[\s\S]*?\n---\n/, "")
      .replace(/^_(Adapted|Derived) from .*$/gm, "");
    const where = rel === "SKILL.md" ? name : `${name}/${rel}`;
    for (const [, called] of body.matchAll(/Skill tool with "([\w-]+)"/g)) {
      if (!skillSet.has(called)) err(where, `calls missing skill "${called}"`);
    }
    for (const [old, repl] of Object.entries(DROPPED)) {
      if (new RegExp(`\\b${old}\\b`).test(body)) err(where, `references dropped skill "${old}" (use "${repl}")`);
    }
    if (/agent-skills:/.test(body)) err(where, `uses the upstream "agent-skills:" namespace`);
    for (const [, cmd] of body.matchAll(/`\/([a-z][a-z-]+)`/g)) {
      if (!skillSet.has(cmd) && !BUILTINS.has(cmd) && !NOT_COMMANDS.has(cmd)) warn(where, `mentions /${cmd}, which is not a skill here`);
    }
  }
}

// ---- report ----
for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
const mergedCount = skills.filter((s) => readFileSync(join(skillsDir, s, "SKILL.md"), "utf8").includes('status: "merged"')).length;
if (upstreamChecked < mergedCount) {
  console.log(`note  merge-growth checked for ${upstreamChecked}/${mergedCount} merged skills; run scripts/upstream-diff.sh once per upstream to populate the cache.`);
}
console.log(`\n${skills.length} skills, ${market.plugins.length} bundles: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
