#!/bin/sh
set -eu

BUCKET_NAME="popli"

# Create bucket once; ignore if it already exists.
awslocal s3api create-bucket --bucket "$BUCKET_NAME" >/dev/null 2>&1 || true

awslocal s3api put-bucket-cors \
  --bucket "$BUCKET_NAME" \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
        "AllowedOrigins": ["http://localhost:3000"],
        "ExposeHeaders": ["ETag"]
      }
    ]
  }'
