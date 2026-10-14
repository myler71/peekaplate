# Security

Do not report customer data, credentials or exploitable details in a public issue. Use GitHub private vulnerability reporting when enabled, or contact a repository owner privately. Do not claim a reporting channel exists until verified in repository settings.

The repository exposes a health endpoint and a staff-authorized dish-revision command, with frontend shells. The local command verifies signed staff identity, checks current restaurant membership and writes through a restricted database role with transaction-local context and row-level security. Hosted routes fail closed until real identity and database bindings are configured. Supabase identity, managed-provider roles and Hyperdrive connection behavior still require staging verification; local tests are not a production security certification. Publication, diner ingestion and cloud resource provisioning remain gated work.

Security-sensitive changes need a reviewer independent of the author, a threat/failure description and negative tests with restricted roles. Check tenant separation, actor authorization, schema validation, replay effects, secret handling and CI trust boundaries. Never run untrusted PR code with deployment secrets or `pull_request_target` privileges.

Secrets belong in vendor/GitHub environment stores; `.env` and `.dev.vars` are ignored. All browser environment values are public. No raw POS exports or session records in this public repository. Retention/deletion must include archives and restore paths.
