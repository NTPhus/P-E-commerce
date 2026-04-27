# 🚀 API Design Guidelines

Detailed standards for designing RESTful APIs in the NestJS backend.

## 1. RESTful Standards
- **Naming**: Use plural nouns for resources (e.g., `/products`, `/users`).
- **Verbs**:
  - `GET`: Retrieve resources.
  - `POST`: Create new resources.
  - `PUT`: Replace a resource entirely.
  - `PATCH`: Partially update a resource.
  - `DELETE`: Remove a resource.
- **Versioning**: All routes must be prefixed with `/v1/`.

## 2. Response Format
All successful responses must follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional descriptive message"
}
```

## 3. Error Handling
Errors must return a 4xx or 5xx status code and follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable error message",
    "details": {} // Optional validation details
  }
}
```

## 4. Pagination
- **List Endpoints**: Must implement pagination.
- **Offset-based** (for Products/Orders):
  - Parameters: `page`, `limit`.
  - Response: Include `meta: { total, page, limit, totalPages }`.
- **Cursor-based** (for Social Feed/Videos):
  - Parameters: `cursor` (usually ID or timestamp), `limit`.
  - Response: Include `meta: { nextCursor, hasMore }`.

## 5. Validation & Security
- **Zod**: Use Zod schemas for all DTOs (Data Transfer Objects).
- **Sanitization**: Strip unknown properties from request bodies.
- **Rate Limiting**: Apply to sensitive endpoints (Login, Register).
