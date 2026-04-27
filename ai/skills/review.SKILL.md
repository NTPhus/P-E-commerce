# 🔍 Review Skill (Audit & Quality)

## 🎯 Capability Overview
Capability to perform deep technical audits of code changes. This skill goes beyond finding syntax errors; it focuses on logical correctness, security vulnerabilities, and architectural alignment.

## 🛡️ Security Auditing
- **OWASP Top 10**: Identifying risks like Injection, Broken Authentication, and Sensitive Data Exposure.
- **Authorization**: Verifying RBAC (Role-Based Access Control) implementation on sensitive endpoints.
- **Input Validation**: Ensuring all user inputs are sanitized and validated via Zod.

## 🚀 Performance & Scalability
- **Database**: Spotting N+1 query problems and suggesting `include`/`select` optimizations.
- **Bundle Size**: Reviewing frontend changes for unnecessary large dependencies.
- **Memoization**: Identifying where `useMemo` or `useCallback` are needed to prevent re-renders.

## 📏 Standards Compliance
- **Rule Enforcement**: Ensuring 100% compliance with `ai/rules.md`.
- **Consistency**: Maintaining a unified "voice" and style across the entire codebase.
- **Documentation**: Verifying that new features are properly documented.

## 🔄 Quality Gates
- Code must pass all automated tests.
- Zero linting/type errors.
- Minimal complexity (Cyclomatic complexity check).
