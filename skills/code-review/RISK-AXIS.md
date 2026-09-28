# Risk axis

The brief for the **Risk** sub-agent: what could break, leak, or slow down in production. Standards covers conventions and Spec covers intent; Risk covers **consequences**. Paste this whole file into the sub-agent's prompt.

## Read the tests first

Tests reveal intent. Before the implementation, check:

- Do tests exist for the changed behaviour, and do they test behaviour rather than internals?
- Would they go red if this change regressed?
- Are edge cases and error paths covered, or only the happy path?

## Correctness

- Edge cases: null, empty, boundary values, off-by-one.
- Error paths handled, not just the happy path.
- Race conditions, stale state, partial failure (what happens when step 2 of 3 fails?).
- Silent fallbacks, `any`/casts or swallowed errors that paper over an unclear invariant.

## Security

For depth, the `security-and-hardening` skill is the source of truth.

- Untrusted input (user, API, file, log, config) validated at the boundary.
- Queries parameterised; output encoded (no XSS).
- AuthN/AuthZ checked on every new path.
- No secrets in code, logs, errors, or version control.
- New dependencies: trusted source, no known CVEs.

## Performance

For depth, the `performance-optimization` skill is the source of truth.

- N+1 queries, unbounded loops, unpaginated list endpoints, unconstrained fetches.
- Synchronous work that should be async; heavy allocation in hot paths.
- Unnecessary UI re-renders.

## Verification story

- Which tests and builds were run? Is there before/after evidence for UI or performance claims?

## Report format

Label each finding with a severity and quote the hunk (file:line):

| Label | Meaning |
|---|---|
| **Critical** | Blocks merge: security hole, data loss, broken functionality |
| **Required** | Must fix before merge |
| **Consider** | Worth doing, not required |
| **Nit** | Optional polish |

Lead with the highest-leverage finding. One real risk beats ten nits. Under 400 words.

_Derived from `code-review-and-quality` in [Addy Osmani's agent-skills](https://github.com/addyosmani/agent-skills) (MIT)._
