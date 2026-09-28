---
name: webperf
description: "Web performance audit (Core Web Vitals, loading, rendering) of a web app, run by a dedicated auditor sub-agent in Quick or Deep mode."
disable-model-invocation: true
license: MIT
metadata:
  source: "addyosmani/agent-skills@2686b62:.claude/commands/webperf.md"
  status: "modified"
---

For web applications only. Do not use on utility libraries, CLIs, or server-only code with no browser-facing output.

## 1. Pick the mode

**Deep mode** when any real measurement is available:

- a Lighthouse JSON report (`npx lighthouse <url> --output json --output-path ./report.json`);
- a PageSpeed Insights or CrUX API response;
- a DevTools performance trace;
- a live URL plus the `chrome-devtools` MCP server (`lighthouse_audit`, `performance_*` tools).

**Quick mode** otherwise: a source scan for structural anti-patterns, with every finding labelled `potential impact`.

## 2. Run the audit

Spawn one general-purpose sub-agent. Give it the full contents of [personas/web-performance-auditor.md](personas/web-performance-auditor.md) as its instructions, plus:

- the files, components or diff under review;
- artifact paths or pasted JSON (Lighthouse, PSI, CrUX, trace);
- the target URL or page, when known;
- the expected mode, so it flags missing inputs if Deep was intended;
- the absolute path to [references/performance-checklist.md](references/performance-checklist.md), its minimum baseline.

If `.claude/agents/web-performance-auditor.md` exists, use that agent type instead.

## 3. Output

Return the auditor's report as-is: the scorecard (sourced values only), ranked findings, and recommendations. For remediation detail, call the Skill tool with "performance-optimization".

_Adapted from [Addy Osmani's agent-skills](https://github.com/addyosmani/agent-skills) (MIT)._
