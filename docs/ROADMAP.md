# Roadmap — Future Enhancements (Phase 2+)

Planned or exploratory directions for later phases. Not yet scheduled; order is not binding.

---

## Autonomous monitoring agents for continuous research tracking

- **Idea:** Background agents that watch topics, queries, or saved interests and re-run or update research when new sources or signals appear.
- **Could include:** Saved “monitors” (topic + schedule), job queue or cron, diff/update reports, notifications (in-app or optional email/webhook).

---

## Hypothesis generation agent

- **Idea:** From a research question or literature synthesis, propose testable hypotheses or sub-questions.
- **Could include:** Structured output (hypothesis + rationale), link to existing results or vault docs, optional export for experiment design.

---

## Experiment design automation

- **Idea:** Help turn hypotheses into concrete experiment plans (methods, variables, controls, sample size considerations).
- **Could include:** Templates or checklists, integration with hypothesis agent, storage of “experiment designs” in the workspace.

---

## Multi-agent orchestration

- **Idea:** Coordinate multiple specialized agents (e.g. retrieval, synthesis, hypothesis, monitoring) with clear handoffs and shared context.
- **Could include:** Orchestrator layer (workflow or state machine), agent roles and capabilities, shared memory or context store, audit trail of agent decisions.

---

## Predictive research trend analysis

- **Idea:** Use historical runs, feedback, and optionally external data to surface trends (e.g. rising topics, confidence over time, citation patterns).
- **Could include:** Aggregations over time, simple forecasting or “trend” scores, visualization on Metrics or a dedicated Trends view.

---

## Proactive insight feed

- **Idea:** A feed of insights the system surfaces without a user-initiated query (e.g. “New vault doc relates to your past query X”, “Confidence trend for topic Y”, “Suggested refinement for Z”).
- **Could include:** Feed API and UI, relevance scoring, user preferences (topics, frequency), link-through to Research/Vault/Metrics.

---

## How to use this roadmap

- **Prioritization:** Pick one or two items per phase; many of these depend on multi-agent orchestration or richer data models.
- **Dependencies:** Multi-agent orchestration and monitoring agents are good foundational steps; hypothesis and experiment design can build on the current synthesis pipeline; trend analysis and insight feed benefit from more usage and feedback data.
- **Contributing:** Open an issue or PR with a concrete design or spike for any item; reference this doc and the relevant phase.
