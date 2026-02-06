#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL não definido."
  exit 1
fi

FILE="${1:-}"
if [[ -z "${FILE}" ]]; then
  echo "Uso: ./scripts/restore-db.sh caminho/para/backup.dump"
  exit 1
fi

if [[ ! -f "${FILE}" ]]; then
  echo "Arquivo não encontrado: ${FILE}"
  exit 1
fi

echo "Restaurando backup ${FILE}..."
pg_restore --clean --no-owner --dbname "${DATABASE_URL}" "${FILE}"
echo "Restauração concluída."
