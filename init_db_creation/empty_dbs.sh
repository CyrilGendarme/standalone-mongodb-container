#!/bin/bash
set -euo pipefail

mongosh \
  --host "${MONGO_HOST:-127.0.0.1}" \
  --port "${MONGO_PORT:-27017}" \
  --username "$MONGO_INITDB_ROOT_USERNAME" \
  --password "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --quiet \
  --file /usr/local/bin/db-scripts/empty_dbs.js
