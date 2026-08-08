# ResearchConnect Website Analytics Architecture & Developer Guide

## 1. Overview & Purpose

The **ResearchConnect Analytics Engine** provides privacy-respecting, performance-optimized discovery, engagement, and productivity metrics for academic researchers, authors, and platform administrators.

The primary purposes of the analytics subsystem are:
* **Researcher Insights**: Enable authors to quantify the reach, citations, downloads, and readership of their published papers.
* **Productivity Tracking**: Summarize publication velocity, active research years, citation growth rates, and top research domains.
* **Profile & Interaction Monitoring**: Measure daily profile visits, CV/paper downloads, and academic network reach.
* **Data-Driven Platform Improvements**: Provide foundational models and aggregation pipelines for understanding user interactions without compromising user privacy.

---

## 2. Architecture & Data Flow

ResearchConnect adopts a strict **Feature-First Clean Architecture** with clear separation of concerns across routes, controllers, services, repositories, and models.

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend UI Layer                      │
│ (PublicationAnalyticsPage, Analytics.jsx, TrendChart.jsx)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP GET (with JWT Bearer)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Service Layer                  │
│               (frontend/src/services/analytics.service.js)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON API Request
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend Express Router                    │
│      (backend/src/modules/publication/routes/analytics.routes.js)│
└──────────────────────────────┬──────────────────────────────┘
                               │ Auth Middleware Verification
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Controller Layer                   │
│ (backend/src/modules/publication/controller/analytics.controller.js)│
└──────────────────────────────┬──────────────────────────────┘
                               │ Invokes Business Logic
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Service Layer                    │
│   (backend/src/modules/publication/service/analytics.service.js)  │
│   - Ownership authorization checks                          │
│   - MongoDB aggregation pipeline execution                  │
│   - Date timeline normalization & zero-filling              │
└──────────────────────────────┬──────────────────────────────┘
                               │ Queries / Aggregations (.lean())
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database & Model Layer                     │
│ (PublicationView, PublicationDownload, DerivedAnalytics,   │
│  ProfileAnalytics, PublicationBookmark, PublicationComment) │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Backend Data Flow
1. **Authentication & Authorization**: Requests hit `/api/v1/publications/.../analytics` through `authMiddleware`. The service verifies that the requesting user (`req.user._id`) owns the requested publication or profile.
2. **Database Aggregation**: Queries utilize MongoDB aggregation pipelines (`$match`, `$group`, `$sort`) or indexed count queries executed with `.lean()` to avoid Mongoose document hydration overhead.
3. **Timeline Normalization**: The service layer normalizes raw daily aggregation outputs by filling date gaps with `0` counts across the requested timeframe (`7d`, `30d`, `90d`) to ensure continuous time-series chart rendering.
4. **Standardized Response**: Data is wrapped in the standard response envelope:
   ```json
   {
     "success": true,
     "message": "Analytics retrieved successfully.",
     "data": { ... },
     "error": null
   }
   ```

### 2.2 Frontend Data Flow
1. **API Client (`analytics.service.js`)**: Makes authenticated HTTP requests via `axiosInstance`, handling request/response interceptors and error propagation.
2. **Component Integration**: Components (e.g., `PublicationAnalyticsPage`, `MetricSummaryCard`, `TrendChart`, `ResearchMetrics`) consume normalized data and handle loading, empty, and error states gracefully.
3. **Visual Rendering**: Time-series charts utilize lightweight, responsive SVG path generation (including smooth cubic Bézier curves) and gradient fills without unnecessary heavy charting dependencies.

---

## 3. Existing Analytics Models & Schemas

The platform maintains specialized Mongoose schemas for distinct analytics dimensions:

### 3.1 `DerivedAnalytics` (`backend/src/models/DerivedAnalytics.js`)
Stores pre-aggregated scholar performance metrics derived from indexed publication data:
* `userId`: Reference to the researcher (`ObjectId`, indexed, unique).
* `totalPublications`: Total count of indexed research papers.
* `journalPapers` / `conferencePapers`: Publication category counts.
* `averageCitations`: Mean citation count per publication.
* `averagePublicationsPerYear`: Annual publishing productivity rate.
* `mostActiveResearchYear`: Peak publishing calendar year.
* `mostCitedPublication`: Reference to the highest-impact paper.
* `mostCitedPublicationTitle`: Title of the most cited paper.
* `mostCitedPublicationCitations`: Highest citation count achieved.
* `mostFrequentKeyword` / `topResearchDomain` / `trendingResearchArea`: Semantic research topics.
* `researchExperience`: Calculated active research span in years.
* `citationGrowthRate` / `publicationGrowthRate`: Growth percentages.
* `researchScore`: Composite productivity and impact score.

### 3.2 `ProfileAnalytics` (`backend/src/models/ProfileAnalytics.js`)
Tracks daily aggregated interactions on a researcher's public profile:
* `userId`: Reference to the researcher (`ObjectId`, indexed).
* `views`: Profile page views for the specific date.
* `downloads`: CV and paper downloads initiated from the profile.
* `shares`: Profile citation and link shares.
* `date`: Truncated day boundary (`YYYY-MM-DD`).
* *Index*: Compound unique index `{ userId: 1, date: 1 }` ensuring fast daily lookups and upserts.

### 3.3 Publication Interaction Models
Granular document models capturing specific engagement signals:
* `PublicationView`: Detailed view logs (`publicationId`, `userId`, `createdAt`).
* `PublicationDownload`: Full-text PDF download events (`publicationId`, `userId`, `createdAt`).
* `PublicationBookmark`: Saved/bookmarked publications (`publicationId`, `userId`, `isDeleted`).
* `PublicationComment`: Discussion and feedback activity (`publicationId`, `userId`, `isDeleted`).
* `PublicationCitation`: Citation export and copy counts (`publicationId`, `copyCount`, `exportCount`).
* `PublicationMetric`: Precalculated publication-level research score.

---

## 4. API Endpoints

All analytics endpoints are versioned under `/api/v1/` and require valid JWT authentication.

### 4.1 Publication Analytics Overview
* **Endpoint**: `GET /api/v1/publications/:id/analytics`
* **Access**: Owner-only (enforced by comparing `publication.userId` with `req.user._id`).
* **Response Payload**:
  * `publication`: Basic metadata (`id`, `title`, `slug`, `type`, `publishedAt`).
  * `summary`: Total views, downloads, bookmarks, comments, citations, recommendations, and research score.
  * `recentActivity`: Rolling 7-day and 30-day views and downloads.

### 4.2 Views Time-Series
* **Endpoint**: `GET /api/v1/publications/:id/analytics/views`
* **Query Parameters**: `period` (`7d`, `30d`, or `90d`; defaults to `30d`).
* **Response Payload**: Daily array containing `{ date: "YYYY-MM-DD", views: Number }`.

### 4.3 Downloads Time-Series
* **Endpoint**: `GET /api/v1/publications/:id/analytics/downloads`
* **Query Parameters**: `period` (`7d`, `30d`, or `90d`; defaults to `30d`).
* **Response Payload**: Daily array containing `{ date: "YYYY-MM-DD", downloads: Number }`.

### 4.4 Profile-Level Publication Analytics
* **Endpoint**: `GET /api/v1/publications/profile-analytics/:profileSlug`
* **Access**: Profile owner only.
* **Response Payload**:
  * `summary`: Aggregated totals across all non-deleted publications for the user (`totalPublications`, `totalViews`, `totalDownloads`, `totalBookmarks`, `totalCitations`, `totalRecommendations`).
  * `typeBreakdown`: Array of `{ type, count }` (e.g., Article, Conference Paper, Preprint, Book Chapter).
  * `topPublications`: Top 5 highest-performing works ranked by views, downloads, and citations.

---

## 5. Performance & Privacy Standards

### 5.1 Privacy Guarantees
* **Zero PII Collection**: Analytics event records never store passwords, authorization tokens, IP addresses, private credentials, or private message content.
* **Strict Ownership Scoping**: Detailed interaction logs and time-series breakdowns are restricted to the author/owner.
* **Soft-Delete Filtering**: All analytics queries explicitly exclude soft-deleted records (`isDeleted: { $ne: true }`).

### 5.2 Performance Optimizations
* **Database-Side Aggregation**: All mathematical reductions and grouping occur directly on the MongoDB server using index-supported pipeline stages.
* **Lean Queries**: Read-only analytics endpoints execute with `.lean()` to bypass Mongoose document hydration overhead.
* **Compound Indexing**: Time-based and user-based queries leverage compound indexes (`{ publicationId: 1, createdAt: -1 }`, `{ userId: 1, date: 1 }`).
* **Zero-Filling Algorithm**: O(N) single-pass date filling in Node.js prevents expensive database bucket filling.

---

## 6. Current Implementation vs. Planned Features

To maintain strict documentation accuracy, below is the status of analytics capabilities:

| Analytics Area | Current Implementation Status | Data Source / Mechanism |
| :--- | :--- | :--- |
| **Publication Views & Downloads** | ✅ Implemented | `PublicationView`, `PublicationDownload` collections with aggregation pipelines |
| **7d / 30d / 90d Timeline Charts** | ✅ Implemented | Aggregation grouped by year/month/day with zero-filled intervals |
| **Citation Velocity & Scholar Indexing** | ✅ Implemented | `DerivedAnalytics` model synced via background scholar queue workers |
| **Profile Engagement & Co-Authorship** | ✅ Implemented | `ProfileAnalytics` daily buckets & co-author graph indexing |
| **Global Administrator Dashboard** | 📋 Planned / Roadmap | Platform-level KPI aggregator for registered users, global publications, and system load |
| **Search Query Keyword Analytics** | 📋 Planned / Roadmap | Search term frequency analysis and discovery tracking |
| **High-Throughput Redis Event Stream** | 📋 Planned / Roadmap | Asynchronous Redis queue buffering for high-velocity view recording |

---

## 7. Local Testing & Verification

To verify the analytics APIs and frontend visualizers locally:

1. **Start the Backend**:
   ```bash
   cd backend
   npm run dev
   ```
2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Execute Endpoint Tests**:
   Authenticated GET requests can be tested against `/api/v1/publications/:id/analytics` with a valid JWT bearer token.
