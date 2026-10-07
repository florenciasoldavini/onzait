# Daily Reports

Purpose: define the initial daily-report domain contract
Source of truth for: report fields, lifecycle semantics, and future persistence rules
Update when: daily-report fields, lifecycle, or persistence change
Last reviewed: 2026-09-19

## Current Scope

`features/daily-reports/types/daily-report.ts` owns `DailyReport`, validated by
`features/daily-reports/schemas/daily-report.schema.ts`. This is a model and runtime
validation contract shared by web, iOS, and Android. Report UI, persistence,
authorization, and lifecycle mutations are not implemented yet.

The report records one project's site-local calendar day. It contains:

- UUID identifiers: `id`, `project_id`, and `workspace_id`.
- `report_date`: a real calendar date in `YYYY-MM-DD` form, never converted to a
  UTC timestamp. The workspace must match the project's workspace.
- `status`: `draft` or `submitted`.
- `weather`: a [manual weather observation](./daily-report-weather.md) or null.
- `created_by`: immutable author UUID, used for audit rather than authorization.
- `submitted_by` and `submitted_at`: both null for drafts; a submitter UUID and
  timestamp for submitted reports. The submitter may differ from the author.
- `created_at`: required timestamp; `updated_at` and `deleted_at`: nullable
  timestamps. Timestamps include UTC or an explicit offset.

`work_summary`, `issues_notes`, and `next_steps` are intentionally excluded until
needed. There is no narrative or weather requirement for submission in this
initial contract. Nullable fields must be present with null when unrecorded.

## Lifecycle and Persistence Contract

When the feature is implemented:

- Enforce one active report per project per date with a database uniqueness rule
  excluding soft-deleted rows. The runtime schema cannot check uniqueness.
- Validate the workspace against the project's canonical workspace. Authorize
  report access through the central project capability engine and RLS, including
  direct collaborators and global-admin support access.
- Allow authorized users to collaborate on drafts. Submitted reports require an
  explicit authorized reopen action before editing.
- Submission records the acting user and trusted server time. Reopening returns
  the report to draft and clears current submission metadata; retain prior
  submissions and reopen actions in append-only report history.
- Derive audit metadata and scope at the trusted boundary. The record schema is
  not a client create/update payload, does not authorize transitions, and cannot
  enforce immutable fields or same-project relationships across records.
- Exclude soft-deleted reports from product get/list queries.
- Preserve recorded observations and historical report content when related
  records change. Future photo/document links need an explicit retention policy.

Attendance links by project and date while a report is a draft. Submitted reports
use immutable attendance snapshots tied to the report and its submission history;
see [attendance.md](./attendance.md) for the implemented model contracts and future
transaction requirements.

Work entries, photo/document links, and deliveries remain separate future
sections. No tables, services, UI, or attachment relationships are introduced by
this model-only change.
