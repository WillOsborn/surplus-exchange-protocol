# Claude Code Development Tools

This directory contains AI development tooling used to build the Surplus Exchange Protocol. It's included in the repository because it's part of how this project was made.

## What's here

- **`agents/`** — Specialised AI subagents for different tasks (research, schema design, security auditing, etc.)
- **`commands/`** — Slash commands for common workflows (`/verify`, `/session-start`, `/session-end`)
- **`skills/`** — Auto-invoked procedures for tasks like schema validation and documentation health checks

## What this requires

These tools work with [Claude Code](https://docs.anthropic.com/en/docs/claude-code), Anthropic's CLI for Claude. They're not required to understand or use the protocol — they're development infrastructure.

## Why include it?

This project was designed and built collaboratively with AI from the outset. The agent definitions, commands, and skills document that process and could be useful as a reference for similar projects.
