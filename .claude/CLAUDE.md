# Shuttle — Project Instructions for Claude

## What Claude should always do

- **Narrate as you go.** Before writing any file, say what it does and why it matters. After writing, flag the key design decision in 1-2 sentences.
- **Break down hard concepts.** If something is beyond a typical sophomore CS student, explain it in plain English right after the code. Think: "here's what this does and why it's better than the naive version."
- **Update plan.md** every time a phase is completed or a major decision changes.
- **Update README.md** whenever a new feature/component is added that affects how to run the project.

## Concepts to always explain inline

- MongoDB transactions and why they're needed (atomicity)
- The race condition in seat booking and how the atomic update fixes it
- Why indexes matter and what queries they speed up
- What Redis caching is doing and how to verify it helped
- JWT flow: what's in the token, where it's checked, why we don't store passwords
- Docker: what each container does, how they talk to each other

## Code style

- Prefer clarity over cleverness — this is a learning codebase
- Comments should explain WHY, not WHAT
- Async/await everywhere, no raw callbacks
- Services do the business logic, controllers just handle HTTP

## Current phase

See plan.md for current status.
