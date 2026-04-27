# Project Agents

This document defines the global instructions for AI agents operating within this repository and outlines how they should interact with the codebase and each other.

## Global Instructions
- All agents must adhere to the rules defined in `ai/rules.md`.
- Maintain state updates in `ai/memory/PROGRESS.md` after significant changes.
- Log architectural decisions in `ai/memory/DECISIONS.md`.

## Agent Workflow
1. **Planner**: Analyzes requirements and breaks them down into a DAG of tasks in `ai/tasks/tasks.json`.
2. **Coder**: Executes tasks assigned by the Planner, adhering to coding standards.
3. **Reviewer**: Validates the Coder's work against the requirements and standards.
