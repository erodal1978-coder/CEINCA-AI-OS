# Hooks System

## Hook Types

- **PreToolUse**: Before tool execution (validation, parameter modification)
- **PostToolUse**: After tool execution (auto-format, checks)
- **Stop**: When session ends (final verification)

## Current Hooks (in `.claude/hooks/hooks.json`, tracked in git — active in any clone)

### PreToolUse
- **tmux reminder**: blocks `npm run dev` / `pnpm dev` / `yarn dev` / `bun run dev` outside tmux, suggesting `tmux new-session -d -s dev "..."` for persistent logs.
- **git push reminder**: prints a reminder to review `git diff`/`git status` before `git push` (does not block the push, does not open an editor).

## Local-only hooks (in `.claude/settings.local.json`, gitignored globally — NOT present in a fresh clone or another machine)

### PostToolUse
- **impeccable design detector**: runs `.claude/skills/impeccable/scripts/hook.mjs` after `Edit`/`Write`/`MultiEdit`, surfaces design findings on UI file changes as a system reminder.

## Auto-Accept Permissions

Use with caution:
- Enable for trusted, well-defined plans
- Disable for exploratory work
- Never use dangerously-skip-permissions flag
- Configure `allowedTools` in `~/.claude.json` instead

## TodoWrite Best Practices

Use TodoWrite tool to:
- Track progress on multi-step tasks
- Verify understanding of instructions
- Enable real-time steering
- Show granular implementation steps

Todo list reveals:
- Out of order steps
- Missing items
- Extra unnecessary items
- Wrong granularity
- Misinterpreted requirements
