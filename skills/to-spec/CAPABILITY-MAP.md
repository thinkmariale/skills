# Capability map

Use this when one request bundles several **independently testable capabilities**, for example identity, billing and notifications. The signs:

- acceptance criteria cluster into groups that could ship and be verified separately;
- one capability could be cut or replaced without rewriting the others' requirements;
- the capabilities have their own consumers or data.

When the request describes a single capability, skip this file.

## Propose the map before any spec

Keep it small: a module table and a build order, not a project plan.

```markdown
# Capability Map: <initiative>

| Module id | Responsibility | Depends on |
|---|---|---|
| identity | Accounts, sessions, SSO | none |
| billing | Plans, invoices, payments | identity |
| notifications | Email and webhook fan-out | identity |
| reporting | Usage dashboards | billing, notifications |

Build order: identity → billing, notifications → reporting
```

- **Stable module ids.** Kebab-case, chosen once and never renamed. Specs and tickets refer to modules by these ids.
- **One-way dependencies.** If two modules each need the other, they are one module.
- **Contracts live at the boundary.** The map records that `billing` depends on `identity`; the contract between them goes in the provider module's spec. The `api-and-interface-design` skill covers designing it.

The user approves boundaries, dependency direction and build order before any module spec is written.

Done when the map is approved. Then write one spec per module, in build order. Each spec is published as its own issue (or `.scratch/<module-id>/spec.md` locally) and names its module id.

If the map has more than about 5 modules, or the boundaries are still unclear after one round, the work is too big for specs yet. Suggest `/wayfinder` instead.

_Derived from `spec-driven-development` in [Addy Osmani's agent-skills](https://github.com/addyosmani/agent-skills) (MIT)._
