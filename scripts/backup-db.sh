#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL não definido."
  exit 1
fi

OUT_DIR="${1:-./backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUT_FILE="${OUT_DIR}/stockfy_backup_${TIMESTAMP}.dump"

mkdir -p "${OUT_DIR}"

echo "Gerando backup em ${OUT_FILE}..."
pg_dump "${DATABASE_URL}" --format=c --no-owner --file "${OUT_FILE}"
echo "Backup concluído."
