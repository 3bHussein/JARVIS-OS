# Connector Contracts and Acceptance Gates

All manifests are read-only scaffolds except the implemented GitHub reader. A listed capability is not evidence of a connected production service. `ReadConnector<T>` defines health() and read(); non-GitHub runtime implementations are TODO.

| Connector | Read / health contract | Permission boundary | Failure and freshness | Required test before enable |
| --- | --- | --- | --- | --- |
| GitHub | GET selected repo, pulls, issues, Actions; health inferred from successful authorized read, not token presence | Fixed personal repo/resource list, server-only token | disconnected/unauthorized/rate_limited/upstream_unavailable/invalid_response; successful timestamp, 5 min budget | GH-01..05 synthetic PASS; real delegated read and expiry TODO |
| ProgressXX | Proposed summary read facade and source watermark; no queue mutation or table mirroring | Owner-linked consent and health domain | unavailable until authorized facade; 15 min budget; pending device state explicitly unknown | Snapshot/table precedence, missing data, tombstones, cross-user denial, no writes |
| WHOOP | Existing whoop-data action=read; health from authenticated response/sync history | Existing backend JWT session, health consent; no new WHOOP OAuth | auth expiry, partial/stale sync history, missing records; 1 hour budget | Synthetic partial read, wrong-user JWT, stale sync, read mode never sync/disconnect |
| Timesheet | Proposed Sheets read-only selected-tab metadata/rows; not getState | Private Google OAuth and configured sheet | permission denied/quota/missing tab; 15 min budget | Token scope, formula-safe projection, no sheet initialization/writes |
| Factory | GitHub status via existing GitHub reader; no local execution | Read-only repo scope | Same GitHub errors; 5 min budget | No workflow dispatch, no local write/execute, safe artifact links |
| Lexora | Launch only; no health/progress endpoint assumed | No localStorage scraping | progress unavailable; 1 day launch metadata budget | Original app opens with safe URL; no claimed progress |
| CloudHub | Proposed delegated metadata-only accounts/files; health is not data authorization | Owner-scoped read token, separate existing session; no file content initially | missing session/provider reconnect/API outage; 5 min budget | Two-user IDOR denial, revoked connection, restart/MEGA expiry, no content/download |
| Autel | None enabled; proposed sanitized operation-only aggregate health | Separately approved corporate identity/domain; never inventory/customer/code routes | blocked by default; no cached payload; 5 min metadata budget if later approved | Corporate-to-personal/AI negative test, no secrets in payload/audit, independent role authorization |

Audit records must contain connector ID, time, actor reference, operation, result code and safe correlation identifier only. Never payloads, free-form error text, health measurements, source issue bodies, authorization headers or customer identifiers. Connector status=ready requires a successful authorized read; configured credentials alone are not a health check.
