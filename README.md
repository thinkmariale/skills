# thinkmariale/skills

My agent skills for Claude Code and other coding agents. I started from the best of two excellent collections, merged the skills they both cover, and keep customizing the result as I use it.

> **Built on the work of others.** Most skills here come from [**mattpocock/skills**](https://github.com/mattpocock/skills) by Matt Pocock and [**addyosmani/agent-skills**](https://github.com/addyosmani/agent-skills) by Addy Osmani. Both are MIT-licensed. Every adapted skill names its upstream source in its frontmatter and ends with a credit line. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the full list and license texts. If you like these skills, go star the originals.

## Install

The skills are split into **bundles**, so each project gets only what it needs.

### Claude Code: bundles, per project

```bash
/plugin marketplace add thinkmariale/skills
/plugin install core@thinkmariale --scope project
/plugin install workflow@thinkmariale --scope project
/plugin install frontend@thinkmariale --scope project   # pick the bundles this project needs
```

`--scope project` records the bundles in `.claude/settings.json`, so everyone on the project gets the same set. Bundles update when this repo changes. Plugin skills are namespaced, e.g. `/core:tdd`.

### Any agent: individual, editable skills

```bash
npx skills@latest add thinkmariale/skills --list
npx skills@latest add thinkmariale/skills --skill tdd --skill code-review
```

This copies plain files into the project that you own and can edit. Nothing updates behind your back. Use `npx skills update` to pull changes.

Pick one method per project. Installing a skill both ways gives you two copies.

### Then, once per repo

Run **`/setup-skills`**. It configures the issue tracker, triage labels and domain-doc layout that the workflow skills rely on. GitHub Issues is the default; you can still ask for local markdown tracking (`.scratch/`) on any piece of work. Not sure which skill fits? Run **`/ask`**.

## Bundles

`/name` means user-invoked: you type it. Every other skill is model-invoked: the agent picks it up when the situation matches, or you can call it yourself.

### core: install everywhere

| Skill | What it does |
|---|---|
| `/ask` | Router: which skill or flow fits your situation |
| `/setup-skills` | One-time per-repo setup: tracker, labels, domain docs |
| `grilling`, `/grill-me`, `/grill-with-docs` | Relentless interview to sharpen a plan; `grill-with-docs` also records a glossary and ADRs |
| `domain-modeling` | Sharpen domain terms in `CONTEXT.md`, record ADRs |
| `codebase-design` | Deep-module vocabulary: module, interface, seam, depth |
| `tdd` ★ | Red-green in vertical slices at agreed seams; stack discovery; prove bugs with a failing test first |
| `diagnosing-bugs` ★ | Build a tight red loop, hypothesise, instrument, fix; stop the line and treat error output as data |
| `code-review` ★ | Three parallel review axes: Standards, Spec, and Risk (correctness, security, performance) |
| `/handoff` | Compact the conversation into a handoff doc |
| `writing-for-agents` | How to write skills, `CLAUDE.md` and `AGENTS.md` |

### workflow: idea → spec → tickets → code

| Skill | What it does |
|---|---|
| `/to-spec` ★ | Conversation to spec, with success criteria, boundaries, open questions and a capability-map check |
| `/to-tickets` ★ | Spec to tracer-bullet tickets with blocking edges, a verify line each, risk-first |
| `/implement` | Build a ticket with `tdd`, finish with `code-review` |
| `/triage` | Move incoming issues through triage states into agent-ready briefs |
| `/wayfinder` | Chart a huge, foggy effort as a map of decision tickets |
| `prototype` | Throwaway code to answer a design question |
| `research` | Background agent researches primary sources into a cited file |
| `/improve-codebase-architecture` | Find deepening opportunities, as a visual report |
| `resolving-merge-conflicts` | Resolve a merge or rebase by intent, hunk by hunk |

### frontend

| Skill | What it does |
|---|---|
| `frontend-ui-engineering` | Production UI: components, state, accessibility, responsive layout |
| `browser-testing-with-devtools` | Verify in a real browser through Chrome DevTools MCP |
| `performance-optimization` | Measure-first performance work across front and back end |
| `/webperf` | Core Web Vitals audit by a dedicated auditor sub-agent |

### backend

| Skill | What it does |
|---|---|
| `api-and-interface-design` | Contract-first APIs, error semantics, Hyrum's Law |
| `security-and-hardening` | Threat modelling, OWASP, secrets, dependency risk |
| `observability-and-instrumentation` | Structured logs, RED metrics, traces, alerts |
| `deprecation-and-migration` | Sunsetting code and zero-downtime expand/contract migrations |

### ship

| Skill | What it does |
|---|---|
| `git-workflow-and-versioning` | Trunk-based flow, atomic commits, releases, changelogs |
| `ci-cd-and-automation` | Pipelines and quality gates |
| `shipping-and-launch` | Pre-launch checklist, staged rollout, rollback plan |
| `/ship` | Parallel reviewer + security + test personas, then a GO / NO-GO decision |

### discipline: rigor when it matters

| Skill | What it does |
|---|---|
| `doubt-driven-development` | Fresh-context adversarial review of each non-trivial decision |
| `source-driven-development` | Ground implementation in official docs, with citations |
| `constraint-driven-development` | Write down the quality bar and guard it against erosion |
| `context-engineering` | Rules files and context-window management |
| `idea-refine` | Diverge and converge on a vague idea |
| `code-simplification` | Behaviour-preserving refactors for clarity |

### extras

| Skill | What it does |
|---|---|
| `/teach` | Multi-session learning workspace |
| `/to-questionnaire` | Turn an open decision into questions for someone else |
| `/wait-what` | Re-pitch a message that didn't land |
| `wizard` | Generate a bash wizard for steps only a human can do |
| `git-guardrails-claude-code` | Hooks that block dangerous git commands |
| `setup-pre-commit` | Husky + lint-staged + typecheck + tests |

★ = merged from both upstreams. See [CLAUDE.md](CLAUDE.md) for how each merge was done.

## Tracking upstream

Each skill's frontmatter records where it came from and how far it has drifted:

```yaml
metadata:
  source: "mattpocock/skills@c55ee46:skills/engineering/tdd"
  also-from: "addyosmani/agent-skills@2686b62:skills/test-driven-development"
  status: "merged"   # verbatim | modified | merged | original
```

```bash
scripts/upstream-diff.sh tdd            # my version vs the upstream I forked
scripts/upstream-diff.sh tdd --latest   # vs upstream today: what have they improved since?
node scripts/check.mjs                  # validate frontmatter, bundles, links and sizes
```

## License

MIT for my changes and original skills ([LICENSE](LICENSE)). Adapted skills remain under their upstream MIT licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
