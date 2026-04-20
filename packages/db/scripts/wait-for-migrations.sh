#!/bin/sh

set -eu

if [ "$#" -eq 0 ]; then
	printf '%s\n' '[wait-for-migrations] no service command provided'
	exit 1
fi

timeout_ms="${DB_MIGRATION_WAIT_TIMEOUT_MS:-300000}"
interval_ms="${DB_MIGRATION_WAIT_INTERVAL_MS:-2000}"

timeout_seconds=$(((timeout_ms + 999) / 1000))
interval_seconds=$(((interval_ms + 999) / 1000))

if [ "$timeout_seconds" -lt 1 ]; then
	timeout_seconds=1
fi

if [ "$interval_seconds" -lt 1 ]; then
	interval_seconds=1
fi

start_time="$(date +%s)"
deadline=$((start_time + timeout_seconds))

while true; do
	if node packages/db/dist/check-migrations.js; then
		status=0
	else
		status=$?
	fi

	if [ "$status" -eq 0 ]; then
		exec "$@"
	fi

	if [ "$status" -ne 3 ]; then
		printf '%s\n' "[wait-for-migrations] fatal migration checker exit code: ${status}"
		exit 1
	fi

	now="$(date +%s)"
	if [ "$now" -ge "$deadline" ]; then
		printf '%s\n' "[wait-for-migrations] timed out after ${timeout_ms}ms waiting for migrations"
		exit 1
	fi

	sleep "$interval_seconds"
done
