---
name: ask
description: Ask which skill or flow fits your situation. A router over the skills in this repo.
disable-model-invocation: true
license: MIT
metadata:
  source: "mattpocock/skills@c55ee46:skills/engineering/ask-matt"
  also-from: "addyosmani/agent-skills@2686b62:skills/using-agent-skills"
  status: "modified"
---

# Ask

You don't remember every skill, so ask. Answer with the one or two skills that fit the user's situation, and why. A project installs only some bundles: if the skill you'd recommend isn't in your available skills, name the bundle to install (`/plugin install <bundle>@thinkmariale --scope project`, or `npx skills@latest add thinkmariale/skills --skill <name>`).

A **flow** is a path through the skills. Most work travels one **main flow**; **on-ramps** merge onto it; **specialists** plug in where their domain comes up.

## Precondition

**`/setup-skills`** (core): run once per repo before the first workflow skill. It configures the issue tracker (GitHub by default, with a local-markdown override), triage labels, and the domain doc layout.

## The main flow: idea → ship

1. **`/grill-with-docs`** (core) sharpens the idea by interview and records what it learns in `CONTEXT.md` and ADRs. No repo under you? **`/grill-me`** runs the same interview statelessly. Idea still vague and you want options, not decisions? **`idea-refine`** (discipline) diverges before grilling converges.
2. **Branch: can every question be settled in conversation?** If one needs a runnable answer, detour: **`/handoff`** out, **`/prototype`** (workflow), **`/handoff`** back.
3. **Branch: is this a multi-session build?**
   - **Yes** → **`/to-spec`** (workflow) turns the thread into a spec with success criteria and boundaries, then **`/to-tickets`** splits it into tracer-bullet tickets with blocking edges. Run **`/implement`** per ticket, `/clear`ing between each.
   - **No** → **`/implement`** right here.

   **`/implement`** drives **`tdd`** one red-green slice at a time, then runs **`/code-review`**: Standards, Spec and Risk axes in parallel.
4. **Going to production?** **`/ship`** (ship) fans out a reviewer, security auditor and test engineer, then returns GO / NO-GO with a rollback plan.

Keep steps 1–3 in one context window until `/to-tickets`; each `/implement` starts fresh from its ticket.

## On-ramps

- **Issues piling up that you didn't write** → **`/triage`** (workflow) produces agent-ready issues for `/implement`. Tickets from `/to-tickets` are already agent-ready; skip triage for them.
- **Something's broken** → **`diagnosing-bugs`** (core). No theories until there is a tight loop that goes red on this bug.
- **A huge, foggy effort, too big for one session** → **`/wayfinder`** (workflow) charts a map of decision tickets and resolves them one at a time, then hands off to `/to-spec`.

## Phase boundaries

At the boundary between phases, choose between: continue, `/clear`, `/handoff`, a subagent, or `/compact`. Read [PHASE-BOUNDARIES.md](PHASE-BOUNDARIES.md) for the decision tree.

## Specialists by domain

Model-invoked: the agent reaches for these when the domain comes up, or name them yourself.

- **Frontend**:
  - `frontend-ui-engineering`: components, state, accessibility, responsive layouts.
  - `browser-testing-with-devtools`: verify in a real browser via Chrome DevTools MCP.
  - `performance-optimization`: measure first, then fix.
  - **`/webperf`**: a Core Web Vitals audit.
- **Backend**:
  - `api-and-interface-design`: contracts, error semantics, versioning.
  - `security-and-hardening`: threat model, OWASP, secrets, dependencies.
  - `observability-and-instrumentation`: logs, metrics, traces, alerts.
  - `deprecation-and-migration`: sunsetting and expand/contract migrations.
- **Ship**:
  - `git-workflow-and-versioning`: branching, commits, releases, changelogs.
  - `ci-cd-and-automation`: pipelines and quality gates.
  - `shipping-and-launch`: pre-launch checklist, staged rollout, rollback.
- **Discipline**, for when correctness matters more than speed:
  - `doubt-driven-development`: adversarial review of each non-trivial decision.
  - `source-driven-development`: ground the work in official docs, with citations.
  - `constraint-driven-development`: write the quality bar down and guard it.
  - `context-engineering`: set up rules files and manage the context window.
  - `code-simplification`: refactor for clarity without changing behaviour.

## Codebase health and vocabulary

- **`/improve-codebase-architecture`** (workflow): surveys the code for deepening opportunities. Pick one and take it to `/grill-with-docs`.
- **`codebase-design`** (core): the deep-module vocabulary (module, interface, seam, depth). `tdd` and architecture work speak it.
- **`domain-modeling`** (core): sharpen domain terms in `CONTEXT.md` and record hard-to-reverse decisions as ADRs.

## Standalone

- **`/grilling`** (core): the bare interview primitive behind `/grill-me` and `/grill-with-docs`.
- **`/research`** (workflow): a background agent reads primary sources and leaves a cited Markdown file.
- **`/resolving-merge-conflicts`** (workflow): resolve an in-progress merge or rebase by intent, hunk by hunk.
- **`writing-for-agents`** (core): the reference for writing skills, `CLAUDE.md` and `AGENTS.md`.
- **Extras**:
  - `/teach`: multi-session learning workspace.
  - `/to-questionnaire`: questions for someone else to answer.
  - `/wait-what`: re-pitch a message that didn't land.
  - `wizard`: a bash script that walks a human through steps only they can do.
  - `git-guardrails-claude-code`: block dangerous git commands.
  - `setup-pre-commit`: Husky + lint-staged.

_Adapted from [Matt Pocock's skills](https://github.com/mattpocock/skills) and [Addy Osmani's agent-skills](https://github.com/addyosmani/agent-skills) (MIT)._
