---
name: ship
description: "Pre-launch go/no-go: fan out a code reviewer, security auditor and test engineer in parallel, then merge their reports into one decision with a rollback plan."
disable-model-invocation: true
license: MIT
metadata:
  source: "addyosmani/agent-skills@2686b62:.claude/commands/ship.md"
  status: "modified"
---

Call the Skill tool with "shipping-and-launch" first: it owns the pre-launch checklist this skill turns into a verdict.

## Phase A: Parallel fan-out

Spawn three general-purpose sub-agents **in a single turn** so they run in parallel. Give each one the full contents of its persona file as its instructions, plus the diff under review (staged changes, or `git diff <base>...HEAD`):

1. [personas/code-reviewer.md](personas/code-reviewer.md): five-axis review (correctness, readability, architecture, security, performance).
2. [personas/security-auditor.md](personas/security-auditor.md): OWASP Top 10, secrets, auth/authz, dependency CVEs, threat model.
3. [personas/test-engineer.md](personas/test-engineer.md): coverage gaps across happy path, edge cases, error paths, concurrency.

Personas never call each other; each returns only its report. If `.claude/agents/` defines an agent with the same name, use that agent type instead: the project's version wins.

**Skip the fan-out only when all hold:** 2 files or fewer, under 50 changed lines, and nothing touches auth, payments, data access, or config/env. Otherwise fan out, even if the diff looks small.

Done when all three reports are back.

## Phase B: Merge (main agent only)

1. **Code quality**: Critical/Important findings from the reviewer, plus any failing tests, lint or build output. Deduplicate across personas.
2. **Security**: every Critical/High auditor finding becomes a launch blocker.
3. **Performance**: the reviewer's performance axis; for web apps, suggest `/webperf`.
4. **Accessibility, infrastructure, docs**: not covered by the personas. Check directly against the `shipping-and-launch` checklist (env vars, migrations, monitoring, feature flags, changelog).

## Phase C: Decision

```markdown
## Ship Decision: GO | NO-GO

### Blockers (must fix before ship)
- [persona: Critical finding + file:line]

### Recommended fixes
- [persona: Important finding + file:line]

### Acknowledged risks (shipping anyway)
- [risk + mitigation]

### Rollback plan
- Trigger conditions:
- Procedure:
- Recovery time objective:

### Specialist reports (full)
```

Rules:

- A rollback plan is mandatory before any GO.
- Any Critical finding means NO-GO unless the user explicitly accepts the risk.

_Adapted from [Addy Osmani's agent-skills](https://github.com/addyosmani/agent-skills) (MIT)._
