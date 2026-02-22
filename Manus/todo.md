# LeapSpace Agentic Deep Research - Project TODO

## Phase 1: Database & Schema
- [x] Create database schema for research queries, vault documents, citations, and feedback
- [x] Set up tables: research_queries, vault_documents, citations, research_results, user_feedback
- [x] Create database helper functions in server/db.ts
- [x] Write vitest tests for database operations

## Phase 2: Core UI - Landing & Research Interface
- [x] Design and implement landing page with research capabilities overview
- [x] Build research query input interface with natural language support
- [x] Create research query form with topic/question input and advanced options
- [x] Implement query history sidebar
- [x] Add vault document upload interface
- [ ] Write component tests

## Phase 3: Research Agent Backend
- [x] Implement RAG retrieval system combining vault + public sources
- [x] Build research agent orchestration with multi-step reasoning
- [x] Create synthesis engine for multi-document analysis
- [x] Implement citation extraction and grounding
- [x] Add confidence scoring system
- [x] Write agent logic tests

## Phase 4: Research Output Display
- [x] Build research result display component with structured sections
- [x] Implement synthesis section with key findings
- [x] Create consensus vs. disagreement analysis view
- [x] Add inline citation display with source links
- [x] Implement confidence score indicators
- [x] Build research gaps identification section
- [x] Add source transparency and evidence traces

## Phase 5: Workspace & Context Integration
- [ ] Implement vault document management (upload, index, search)
- [ ] Build workspace-aware retrieval combining vault + public sources
- [ ] Create research history tracking and saved queries
- [ ] Implement query refinement and iteration workflows
- [ ] Add document preview and annotation features

## Phase 6: Trust & Feedback Infrastructure
- [ ] Implement user feedback collection on research quality
- [ ] Build feedback submission forms
- [ ] Create attribution engine for source traceability
- [ ] Implement explainability layer showing reasoning paths
- [ ] Add model performance tracking
- [ ] Build evaluation metrics dashboard

## Phase 7: Polish & Testing
- [ ] End-to-end testing of research workflows
- [ ] UI/UX refinement and accessibility audit
- [ ] Performance optimization
- [ ] Error handling and edge cases
- [ ] Documentation and user guides
- [ ] Create final checkpoint

## Future Enhancements (Phase 2+)
- [ ] Autonomous monitoring agents for continuous research tracking
- [ ] Hypothesis generation agent
- [ ] Experiment design automation
- [ ] Multi-agent orchestration
- [ ] Predictive research trend analysis
- [ ] Proactive insight feed
