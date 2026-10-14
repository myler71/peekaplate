# Security

Do not report customer data, credentials or exploitable details in a public issue. Use GitHub private vulnerability reporting when enabled, or contact a repository owner privately. Do not claim a reporting channel exists until verified in repository settings.

This scaffold exposes only a health endpoint and empty frontend shells. Database tables default to denied application access. Authentication, scoped grants, publish functions, ingestion and cloud resource provisioning are later gated work; the scaffold is not a production security certification.

Security-sensitive changes need a reviewer independent of the author, a threat/failure description and negative tests with restricted roles. Check tenant separation, actor authorization, schema validation, replay effects, secret handling and CI trust boundaries. Never run untrusted PR code with deployment secrets or `pull_request_target` privileges.

Secrets belong in vendor/GitHub environment stores; `.env` and `.dev.vars` are ignored. All browser environment values are public. No raw POS exports or session records in this public repository. Retention/deletion must include archives and restore paths.
