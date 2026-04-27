# ⚠️ Project Risks & Mitigation

Identification of technical and business risks for the P-E-commerce platform.

## 1. Technical Risks

### R1: Latency in Recommendation Engine
- **Description**: Real-time calculation of scores across millions of interactions can slow down feed generation.
- **Mitigation**:
  - Implement a scoring worker that updates scores asynchronously.
  - Use Redis to cache the top recommended items for each user.
  - Optimize Prisma queries with covering indexes.

### R2: Media Storage & Bandwidth Costs
- **Description**: High volume of short videos can lead to massive Cloudinary costs.
- **Mitigation**:
  - Implement strict upload limits for non-verified sellers.
  - Use aggressive Cloudinary transformations (`f_auto, q_auto`) to reduce file size.
  - Implement lazy-loading and pre-fetching only for the next 2-3 videos.

### R3: Database Contention (Social Feed)
- **Description**: Frequent Writes (Likes/Comments) and Reads (Feed) on the same tables.
- **Mitigation**:
  - Use Read Replicas for Feed generation if scale increases.
  - Buffer "Likes" in Redis before flushing to PostgreSQL in batches.

## 2. Business & Security Risks

### R4: Fake Orders & Spam
- **Description**: Bot-driven social interactions or fake purchases to boost shop ratings.
- **Mitigation**:
  - Implement rate limiting and CAPTCHA for sensitive actions.
  - Rule-based detection for unusual interaction patterns.

### R5: Content Moderation
- **Description**: Illegal or inappropriate videos/posts.
- **Mitigation**:
  - Implement a flagging system for users.
  - Admin moderation dashboard with priority queues.
  - Potential integration of automated scanning (Future phase).
