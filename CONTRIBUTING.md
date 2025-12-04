# Contributing to JobsearchAI

Thank you for contributing to JobsearchAI! This document provides guidelines and instructions for contributing to the project.

## Development Workflow

This project follows an Epic/PR structure as outlined in [docs/PRD.md](docs/PRD.md). Each Epic is broken down into Pull Requests (PRs), which are further divided into commits and subtasks.

## Using Cursor IDE for Development

This project is optimized for AI-assisted development using Cursor IDE. The `.cursorrules` file contains project-specific rules that guide AI code generation.

### Generating PRs from Task Lists

1. **Reference the Task List**: Open [docs/TASKS.md](docs/TASKS.md) or [docs/MULTI-DEV.md](docs/MULTI-DEV.md)

2. **Ask Cursor to Implement**: Use prompts like:
   - "Implement PR 0-1: Initialize typed MemoryBank service from TASKS.md"
   - "Create the onboarding wizard components as specified in Epic 1, PR 1-1"
   - "Follow the plan in PRD.md for Epic 2, PR 2-1"

3. **Cursor Will**:
   - Read the relevant documentation
   - Follow `.cursorrules` conventions
   - Generate code following SOLID principles
   - Create appropriate tests
   - Use conventional commit messages

### Best Practices with Cursor

- Always reference specific Epics/PRs from the documentation
- Let Cursor read the full context before making changes
- Review generated code for adherence to `.cursorrules`
- Run tests before committing: `npm test`
- Run linter: `npm run lint`

## Pull Request Template

When creating a PR, use this template:

```markdown
## Description
Brief description of what this PR accomplishes. Reference the Epic and PR number from [docs/PRD.md](docs/PRD.md).

**Epic**: [Epic Number]  
**PR**: [PR Number]

## Changes
- [ ] List of specific changes made
- [ ] Each change should be a separate bullet point
- [ ] Reference files modified/created

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)

## Checklist
- [ ] Code follows `.cursorrules` conventions
- [ ] SOLID principles adhered to
- [ ] TypeScript types properly defined
- [ ] Error handling implemented
- [ ] Documentation updated (if needed)
- [ ] README updated (if needed)

## Related Issues
Closes #[issue number] (if applicable)
```

## Code Review Checklist

Reviewers should check:

- [ ] Code follows `.cursorrules` (30 rules)
- [ ] SOLID principles are followed
- [ ] Naming conventions are correct (PascalCase components, camelCase hooks, etc.)
- [ ] Zod is used for form validation
- [ ] shadcn components are used where appropriate
- [ ] MemoryBank is used for session persistence (not direct IndexedDB)
- [ ] Tests are comprehensive and passing
- [ ] No TypeScript `any` types
- [ ] Error handling is present
- [ ] Commit messages follow conventional format

## Testing Requirements

1. **Unit Tests**: All new services and hooks must have tests
   - Use Vitest: `npm test`
   - Mock external dependencies
   - Test edge cases and error conditions

2. **Manual Testing**: Test the feature in the browser
   - Verify UI/UX works as expected
   - Test error scenarios
   - Verify data persistence (if applicable)

3. **Linting**: Ensure no linting errors
   - Run `npm run lint`
   - Fix all warnings and errors

## Commit Message Format

Use conventional commits:

- `[feat]` - New feature
- `[fix]` - Bug fix
- `[refactor]` - Code restructuring
- `[test]` - Test additions/changes
- `[docs]` - Documentation updates
- `[chore]` - Maintenance tasks

Example:
```
[feat] Add MemoryBank service for session persistence
[fix] Resolve IndexedDB migration issue
[test] Add unit tests for MemoryBank CRUD operations
```

## Epic Structure

Epics are designed to be:
- **Independent**: Can be worked on in parallel (when dependencies allow)
- **Atomic**: Each PR is a complete, testable unit
- **Non-Conflicting**: File ownership is clear to avoid merge conflicts

See [docs/MULTI-DEV.md](docs/MULTI-DEV.md) for parallel development guidelines.

## Getting Started

1. **Read the Documentation**:
   - [docs/PRD.md](docs/PRD.md) - Product requirements and epic breakdown
   - [docs/TASKS.md](docs/TASKS.md) - Detailed task checklist
   - [.cursorrules](.cursorrules) - Project conventions

2. **Set Up Development Environment**:
   ```bash
   npm install
   npm run dev
   ```

3. **Pick an Epic**: Start with Epic 0 (if not done), then follow the dependency chain

4. **Create a Branch**: 
   ```bash
   git checkout -b epic-X-pr-Y-description
   ```

5. **Implement**: Use Cursor IDE with the task list as reference

6. **Test**: Run tests and linting before committing

7. **Commit**: Use conventional commit format

8. **Push & PR**: Create a PR using the template above

## Questions?

- Check [docs/PRD.md](docs/PRD.md) for requirements
- Review [.cursorrules](.cursorrules) for coding conventions
- Look at existing code for patterns and examples

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

