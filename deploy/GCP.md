# GCP Deployment Guide — CodeReview AI

## Architecture

| Component | GCP Service |
|-----------|-------------|
| Backend API | Cloud Run |
| Database | Cloud SQL (PostgreSQL) |
| API keys / JWT | Secret Manager |
| Code uploads (optional) | Cloud Storage |
| Monitoring | Cloud Monitoring (auto with Cloud Run) |
| AI | Gemini API (Google AI Studio) |

## 1. Enable APIs

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  monitoring.googleapis.com
```

## 2. Cloud SQL PostgreSQL

```bash
gcloud sql instances create codereview-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

gcloud sql databases create codereview_ai --instance=codereview-db

gcloud sql users create codereview_app \
  --instance=codereview-db \
  --password=YOUR_SECURE_PASSWORD
```

Connection string (for Secret Manager):

```
postgresql://codereview_app:PASSWORD@/codereview_ai?host=/cloudsql/PROJECT_ID:us-central1:codereview-db
```

Run schema after deploy or via Cloud SQL proxy:

```bash
npm run db:init
```

## 3. Secret Manager

```bash
echo -n "your-gemini-key" | gcloud secrets create gemini-api-key --data-file=-
echo -n "long-random-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "postgresql://..." | gcloud secrets create database-url --data-file=-
```

Grant Cloud Run service account access:

```bash
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

## 4. Deploy Backend (Cloud Run)

From project root:

```bash
gcloud builds submit --config=deploy/cloudbuild.yaml .
```

Or manually:

```bash
cd backend
gcloud run deploy codereview-ai-api \
  --source . \
  --region us-central1 \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest,JWT_SECRET=jwt-secret:latest,DATABASE_URL=database-url:latest
```

## 5. Frontend

Build and host on Firebase Hosting, Cloud Storage + CDN, or Vercel:

```bash
cd frontend
npm run build
# Upload dist/ to your static host
# Set VITE_API_URL or configure proxy to Cloud Run URL
```

Update `CORS_ORIGIN` on Cloud Run to your frontend URL.

## 6. Cloud Storage (optional uploads)

```bash
gcloud storage buckets create gs://PROJECT-codereview-uploads --location=us-central1
```

Wire bucket credentials in backend if extending file storage beyond client-side reads.

## 7. Monitoring

- Cloud Run metrics: latency, errors, instance count
- Create alert policies in Cloud Monitoring for 5xx rate and latency SLOs
- Log-based metrics from structured `console.error` in API

## Local development

1. Copy `backend/.env.example` to `backend/.env`
2. Start PostgreSQL locally
3. `npm run db:init` in backend
4. `npm run dev` in backend and frontend
