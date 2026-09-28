# thinkmariale/skills

A skills repo that also serves as a Claude Code plugin marketplace.

- `skills/<name>/` is flat, one directory per skill. `npx skills` discovers skills here.
- `.claude-plugin/marketplace.json` groups the skills into 7 bundles (plugins).

Most skills are adapted from mattpocock/skills and addyosmani/agent-skills (MIT).

## Rules

1. **One bundle per skill.** Every skill appears in exactly one plugin's `skills` list in `marketplace.json`.
2. **`name` equals the directory name.** The description says *when* to use the skill, in 1024 characters or fewer.
3. **Attribution stays honest.** Every non-original skill has `license: MIT` plus these `metadata` fields, and ends with the `_Adapted from …_` credit line:
   - `source`: `"<owner>/<repo>@<commit>:<path>"`
   - `also-from`: set only when the skill is merged from two upstreams
   - `status`: `verbatim` | `modified` | `merged` | `original`

   The first time you edit a `verbatim` skill, flip it to `modified`. New skills use `status: "original"` with no `source`.
4. **Keep skills small.** Read the `writing-for-agents` skill before writing or merging a skill.
   - A `SKILL.md` we merge or write stays under 200 lines.
   - A merge adds at most ~25 body lines over its base.
   - Put detail in an UPPERCASE supporting file next to `SKILL.md` (e.g. `RISK-AXIS.md`), linked one level deep with a line saying when to read it.
   - Point to another skill instead of copying its content.
5. **Self-contained skills.** A skill must work when installed alone via `npx skills`:
   - No `../` links. Shared checklists are copied into each skill's `references/`.
   - Personas live in the skill's `personas/` folder, not in a root `agents/`.
6. **Cross-skill calls** are written as `Call the Skill tool with "<name>"`, never as file links. A user-invoked skill (`disable-model-invocation: true`) can call model-invoked skills, but never another user-invoked one.
7. **Adding or removing a skill** means updating `marketplace.json`, the `/ask` router, the README tables and `THIRD_PARTY_NOTICES.md`.
8. **Before committing,** run `node scripts/check.mjs` and `claude plugin validate .`.

## Consolidation decisions

**Dropped upstream skills and their replacements here** (the checker also enforces this list):

| Dropped | Replaced by |
|---|---|
| `interview-me` | `grilling` |
| `test-driven-development` | `tdd` |
| `debugging-and-error-recovery` | `diagnosing-bugs` |
| `code-review-and-quality` | `code-review` |
| `spec-driven-development` | `to-spec` |
| `planning-and-task-breakdown` | `to-tickets` |
| `incremental-implementation` | `implement` |
| `documentation-and-adrs` | `domain-modeling` |
| `using-agent-skills`, `ask-matt` | `ask` |
| `setup-matt-pocock-skills` | `setup-skills` |

**Merged skills.** Matt's version is the base in every case; Addy contributed these additions:

| Skill | Additions from Addy |
|---|---|
| `tdd` | Stack discovery, Prove-It rule for bugs, finishing on the full suite, `TESTING-PATTERNS.md` |
| `diagnosing-bugs` | Stop-the-line rule, treating error output as untrusted data |
| `code-review` | A third, parallel Risk axis (`RISK-AXIS.md`) |
| `to-spec` | Success Criteria, Boundaries, Open Questions, `CAPABILITY-MAP.md` |
| `to-tickets` | Verify line per ticket, split heuristics, risk-first ordering, protecting open work |

**Commands converted to skills.** Addy's `/ship` and `/webperf` commands became user-invoked skills that carry their personas.

**Trim candidates.** Several of Addy's skills are 220–500 lines upstream. Trim them over time, using `writing-for-agents`; `node scripts/check.mjs` lists them.

**Dropped without replacement:**
- Codex `agents/openai.yaml` files: restore them from upstream if Codex plugins are ever a target.
- Addy's hooks and evals.
- Matt's `in-progress/` skills.
