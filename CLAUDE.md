# PeekaPlate

Read @AGENTS.md, then @docs/CONTEXT.md and task-relevant ADRs. These are the shared repository instructions; do not maintain a second architectural policy here.

Use `/agents` to discover the repo's review coordinator, architecture reviewer, correctness reviewer and repo guide. Start a coordinated review with `claude --agent review-coordinator` and provide a fixed Git base and head. If delegation is unavailable, perform the two review passes sequentially and label that limitation.
