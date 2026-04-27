# 🧪 Testing Skill (Verification)

## 🎯 Capability Overview
Capability to design and implement a comprehensive testing strategy that ensures software reliability. Focuses on the "Testing Pyramid" approach.

## 🏗️ Testing Layers
- **Unit Testing (Vitest)**: Writing atomic tests for pure functions, services, and utility logic. Focus on high coverage for business rules.
- **Integration Testing**: Testing the interaction between NestJS modules, Prisma, and the Database using test containers or mock DBs.
- **E2E Testing (Playwright)**: Automating critical user journeys (e.g., Signup -> Add to Cart -> Checkout).
- **Component Testing**: Verifying React components in isolation using React Testing Library.

## 🧪 Methodologies
- **TDD (Test-Driven Development)**: Writing tests before implementation for complex logic.
- **Boundary Testing**: Ensuring edge cases (null values, empty lists, max limits) are handled.
- **Regression Testing**: Ensuring new changes don't break existing functionality.

## 📊 Quality Metrics
- **Coverage**: Aiming for >80% coverage on core business logic.
- **Reliability**: Zero-flaky-test policy.
- **Performance**: Tests must run fast to maintain CI/CD efficiency.
