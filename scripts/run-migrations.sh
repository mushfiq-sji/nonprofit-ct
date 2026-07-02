#!/usr/bin/env bash
#
# Run Supabase migrations and report success or failure.
# Use:  npm run migrations:run   (not npx run)
# Or:  ./scripts/run-migrations.sh
#
# To run automatically when you commit new migrations, install the hook:
#   ./scripts/setup-migration-hook.sh
#

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

echo "Running Supabase migrations..."
echo ""

# Use npx so the project's devDependency (supabase) is used; no global install needed
SUPABASE_CMD="npx supabase"
if ! $SUPABASE_CMD --version &> /dev/null; then
  echo -e "${RED}Error: Supabase CLI not found.${NC}"
  echo "Install the project dependency: npm install"
  echo "Or install globally: https://supabase.com/docs/guides/cli"
  exit 1
fi

DB_URL="${DATABASE_URL:-${SUPABASE_DB_URL:-}}"
PUSH_ARGS=(db push --yes)

if [[ -n "$DB_URL" ]]; then
  echo "Using DATABASE_URL from .env (direct Postgres connection)"
  PUSH_ARGS+=(--db-url "$DB_URL" --linked false)
else
  echo "Using linked Supabase project (requires: npx supabase login && npx supabase link)"
fi

output=$($SUPABASE_CMD "${PUSH_ARGS[@]}" 2>&1)
exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo -e "${GREEN}✓ Migrations applied successfully.${NC}"
  echo ""
  echo "$output"
  exit 0
else
  echo -e "${RED}✗ Migration failed.${NC}"
  echo ""
  echo "$output"
  echo ""
  echo -e "${YELLOW}Troubleshooting:${NC}"
  if echo "$output" | grep -q "Remote migration versions not found in local"; then
    echo "  • Remote history doesn't match local. Run: npm run migrations:repair"
  fi
  if echo "$output" | grep -q "already exists"; then
    echo "  • Schema already on remote. To sync history without re-running migrations: npm run migrations:mark-applied"
  fi
  if [[ -z "$DB_URL" ]]; then
    echo "  • Add DATABASE_URL to .env (Supabase Dashboard → Database → Connection string), then re-run"
    echo "  • Or: npx supabase login && npx supabase link --project-ref YOUR_REF"
    echo "  • Lovable-only: npm run migrations:concat → paste supabase/bootstrap-all-migrations.sql in SQL Editor"
  fi
  echo "  • Check migration SQL for syntax errors"
  echo "  • Run locally first: npx supabase start && npx supabase db reset"
  exit $exit_code
fi
