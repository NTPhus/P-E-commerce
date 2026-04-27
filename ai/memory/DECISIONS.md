# Architectural Decisions

Log of major technical decisions, their rationale, and trade-offs.

## Decisions Log

### [2026-04-26] Core Architecture Design
- **Decision**: Adopted **TurboRepo** Monorepo structure.
- **Rationale**: To share types (Prisma/Zod) and UI components between apps (Web, Api, Admin) easily.
- **Decision**: **NestJS** with Modular Architecture for the backend.
- **Rationale**: Provides clear separation of concerns (Auth, Social, Product, etc.) and is ready for microservices migration.
- **Decision**: **Rule-based Recommendation Engine** (No AI).
- **Rationale**: Strict constraint to avoid external AI costs/dependencies while maintaining personalization via behavioral scoring.
- **Decision**: **Zod** for end-to-end validation.
- **Rationale**: Shared schemas between Frontend and Backend ensures type safety.
