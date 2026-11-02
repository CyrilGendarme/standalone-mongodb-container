#!/bin/bash
set -euo pipefail

docker-entrypoint.sh "$@" &
mongo_pid=$!

terminate_mongodb() {
  kill -TERM "$mongo_pid" 2>/dev/null || true
}
trap terminate_mongodb TERM INT

echo "[INFO] Waiting for MongoDB to accept authenticated connections..."
until mongosh \
  --host "${MONGO_HOST:-127.0.0.1}" \
  --port "${MONGO_PORT:-27017}" \
  --username "$MONGO_INITDB_ROOT_USERNAME" \
  --password "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --quiet \
  --eval 'quit(db.adminCommand({ ping: 1 }).ok ? 0 : 1)' >/dev/null 2>&1
do
  if ! kill -0 "$mongo_pid" 2>/dev/null; then
    if wait "$mongo_pid"; then
      echo "[ERROR] MongoDB exited before becoming ready." >&2
      exit 1
    else
      status=$?
      echo "[ERROR] MongoDB exited before becoming ready (status $status)." >&2
      exit "$status"
    fi
  fi
  echo "[INFO] MongoDB is not ready yet."
  sleep 1
done

/usr/local/bin/db-scripts/create_multiple_dbs.sh

wait "$mongo_pid"
