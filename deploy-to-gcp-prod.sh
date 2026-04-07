#!/usr/bin/env bash
#
# Deploy backend and/or website to GCP Cloud Run from local environment.
# Mirrors .github/workflows/development.yml but uses interactive gcloud auth.
#
# Usage: ./deploy-to-gcp.sh [backend|website|all]
#   backend  - deploy only the backend app
#   website  - deploy only the website (frontend) app
#   all      - deploy both apps (default when no parameter is provided)
#
# Prerequisites: Docker, gcloud CLI (gcloud components install beta if needed).
#   For website: bun (https://bun.sh)
#

set -euo pipefail

DEPLOY_TARGET="${1:-all}"
case "${DEPLOY_TARGET}" in
  backend|website|frontend|all) ;;
  -h|--help)
    echo "Usage: $0 [backend|website|all]"
    echo "  backend  - deploy only the backend app"
    echo "  website  - deploy only the website (frontend) app"
    echo "  all      - deploy both apps (default)"
    exit 0
    ;;
  *)
    echo "Error: invalid target '${DEPLOY_TARGET}'. Use: backend, website, or all"
    exit 1
    ;;
esac
# Normalize frontend -> website
[[ "${DEPLOY_TARGET}" == "frontend" ]] && DEPLOY_TARGET="website"

DEPLOY_BACKEND=false
DEPLOY_WEBSITE=false
[[ "${DEPLOY_TARGET}" == "backend" || "${DEPLOY_TARGET}" == "all" ]] && DEPLOY_BACKEND=true
[[ "${DEPLOY_TARGET}" == "website" || "${DEPLOY_TARGET}" == "all" ]] && DEPLOY_WEBSITE=true

PROJECT_ID="${GCP_PROJECT_ID:-popli-465817}"
REGION="${GCP_REGION:-europe-west1}"
REPO="${REGION}-docker.pkg.dev/${PROJECT_ID}/production"
# Cloud Run requires amd64/linux; build for this platform when on ARM (e.g. Apple Silicon)
PLATFORM="linux/amd64"
GIT_SHA="$(git rev-parse HEAD)"
IMAGE_BACKEND_SHA="${REPO}/backend:${GIT_SHA}"
IMAGE_BACKEND_LATEST="${REPO}/backend:latest"
IMAGE_FRONTEND_SHA="${REPO}/frontend:${GIT_SHA}"
IMAGE_FRONTEND_LATEST="${REPO}/frontend:latest"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_CR="${SCRIPT_DIR}/backend/cloud-run/production.yml"
WEBSITE_CR="${SCRIPT_DIR}/website/cloud-run/production.yml"

# Service account allowed to invoke the backend (Cloud Run IAM).
# Ensure your production-frontend service runs as this service account.
WEBSITE_INVOKER_SA_EMAIL="${WEBSITE_INVOKER_SA_EMAIL:-website-service-account@${PROJECT_ID}.iam.gserviceaccount.com}"

echo "=== Deploy to GCP (production) ==="
echo "  Project: ${PROJECT_ID}"
echo "  Region:  ${REGION}"
echo "  Tag:     ${GIT_SHA} + latest"
echo "  Target:  ${DEPLOY_TARGET}"
echo ""

# --- 1. Ensure gcloud and Docker are available ---
if ! command -v gcloud &>/dev/null; then
  echo "Error: gcloud CLI is not installed. Install from https://cloud.google.com/sdk/docs/install"
  exit 1
fi
if ! command -v docker &>/dev/null; then
  echo "Error: Docker is not installed or not running."
  exit 1
fi
if [[ "${DEPLOY_WEBSITE}" == true ]] && ! command -v bun &>/dev/null; then
  echo "Error: bun is required for the website build. Install from https://bun.sh"
  exit 1
fi

# --- 2. Authenticate with GCP (interactive: browser or paste code in terminal) ---
echo ">>> Authenticating with Google Cloud (you may be prompted in browser or terminal)..."
gcloud auth login
gcloud config set project "${PROJECT_ID}"

# --- 3. Configure Docker to use Artifact Registry ---
echo ">>> Configuring Docker for Artifact Registry..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# --- 4. Build and push Docker images (buildx avoids OCI index / provenance so Cloud Run accepts the image) ---
# Cloud Run rejects manifest type application/vnd.oci.image.index.v1+json without amd64/linux; buildx with
# --provenance=false --sbom=false pushes a single image manifest.
if [[ "${DEPLOY_BACKEND}" == true ]]; then
  echo ">>> Building and pushing backend: ${IMAGE_BACKEND_SHA} (${PLATFORM})"
  docker buildx build \
    --platform "${PLATFORM}" \
    --provenance=false \
    --sbom=false \
    -t "${IMAGE_BACKEND_SHA}" \
    -t "${IMAGE_BACKEND_LATEST}" \
    -f "${SCRIPT_DIR}/backend/docker/Dockerfile.gcp" \
    "${SCRIPT_DIR}/backend" \
    --push
fi

if [[ "${DEPLOY_WEBSITE}" == true ]]; then
  echo ">>> Building and pushing frontend: ${IMAGE_FRONTEND_SHA} (${PLATFORM})"
  docker buildx build \
    --platform "${PLATFORM}" \
    --provenance=false \
    --sbom=false \
    -t "${IMAGE_FRONTEND_SHA}" \
    -t "${IMAGE_FRONTEND_LATEST}" \
    -f "${SCRIPT_DIR}/website/docker/Dockerfile" \
    "${SCRIPT_DIR}/website" \
    --push
fi

# --- 5. Deploy to Cloud Run (use temp files so we don't modify repo) ---
BACKEND_CR_TMP="$(mktemp)"
WEBSITE_CR_TMP="$(mktemp)"
trap 'rm -f "${BACKEND_CR_TMP}" "${WEBSITE_CR_TMP}"' EXIT

if [[ "${DEPLOY_BACKEND}" == true ]]; then
  echo ">>> Deploying backend to Cloud Run..."
  sed "s|IMAGE_TAG|${GIT_SHA}|g" "${BACKEND_CR}" > "${BACKEND_CR_TMP}"
  gcloud beta run services replace "${BACKEND_CR_TMP}" --region="${REGION}" --platform=managed
fi

if [[ "${DEPLOY_WEBSITE}" == true ]]; then
  echo ">>> Deploying website to Cloud Run..."
  sed "s|IMAGE_TAG|${GIT_SHA}|g" "${WEBSITE_CR}" > "${WEBSITE_CR_TMP}"
  gcloud beta run services replace "${WEBSITE_CR_TMP}" --region="${REGION}" --platform=managed
fi

# --- 6. IAM (invoker access) ---
if [[ "${DEPLOY_BACKEND}" == true ]]; then
  echo ">>> Setting IAM for backend (private; only website service account can invoke)..."
  # Grant invoker to website service account
  gcloud run services add-iam-policy-binding production-backend \
    --region="${REGION}" \
    --member="serviceAccount:${WEBSITE_INVOKER_SA_EMAIL}" \
    --role=roles/run.invoker \
    --quiet 2>/dev/null || true
fi
if [[ "${DEPLOY_WEBSITE}" == true ]]; then
  echo ">>> Setting IAM for frontend (public access)..."
  gcloud run services add-iam-policy-binding production-frontend \
    --region="${REGION}" \
    --member=allUsers \
    --role=roles/run.invoker \
    --quiet 2>/dev/null || true
fi

echo ""
echo "=== Deployment complete ==="
[[ "${DEPLOY_BACKEND}" == true ]]  && echo "  Backend:  production-backend (image tag: ${GIT_SHA})"
[[ "${DEPLOY_WEBSITE}" == true ]]  && echo "  Frontend: production-frontend (image tag: ${GIT_SHA})"
echo "  Images also tagged as :latest in Artifact Registry."
