# Testing Requirements

## Minimum Test Coverage: 80%

Test Types (ALL required):
1. **Unit Tests** - Individual functions, utilities, components
2. **Integration Tests** - API endpoints, database operations
3. **E2E Tests** - Critical user flows (Playwright)

## Test-Driven Development

MANDATORY workflow:
1. Write test first (RED)
2. Run test - it should FAIL
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Verify coverage (80%+)

## Troubleshooting Test Failures

1. Check test isolation
2. Verify mocks are correct
3. Fix implementation, not tests (unless tests are wrong)

## Agent Support

- `tdd-workflow` skill - enforces write-tests-first
- No dedicated E2E agent currently — `e2e-runner` was removed (2026-08-27, cleanup PR) for being unadaptably tied to an unrelated project. Write E2E tests directly with Playwright, or reintroduce a lean agent if `carrusel-export` needs one.
