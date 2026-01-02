#!/bin/bash
#
# Database migration script for Budget Tracker (Linux/NAS)
#
# This script runs database migrations for the Budget Tracker application.
# It can be run either directly on the host or inside the Docker container.
#
# Usage:
#   # Run migrations on the host database (./data/budget_tracker.db)
#   ./run-migrations.sh
#
#   # Run migrations inside the Docker container
#   ./run-migrations.sh --docker
#
#   # Show migration status
#   ./run-migrations.sh --status
#
#   # Run with custom database path
#   DATABASE_URL=sqlite:///path/to/db.sqlite ./run-migrations.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Default database URL (relative to project root)
DEFAULT_DB_URL="sqlite:///${PROJECT_ROOT}/data/budget_tracker.db"

show_help() {
    echo "Database Migration Script for Budget Tracker"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --status        Show current migration status"
    echo "  --downgrade     Downgrade one revision"
    echo "  --stamp-head    Stamp database with current head (for existing DBs)"
    echo "  --docker        Run migrations inside the Docker container"
    echo "  -h, --help      Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DATABASE_URL    Database connection URL"
    echo "                  Default: $DEFAULT_DB_URL"
    echo ""
    echo "Examples:"
    echo "  # Run migrations"
    echo "  $0"
    echo ""
    echo "  # Run migrations in Docker container"
    echo "  $0 --docker"
    echo ""
    echo "  # Show status"
    echo "  $0 --status"
    echo ""
    echo "  # Run with specific database"
    echo "  DATABASE_URL=sqlite:////data/budget_tracker.db $0"
}

run_in_docker() {
    echo "Running migrations inside Docker container..."
    docker exec budget-tracker-backend python /app/migrate.py "$@"
}

run_locally() {
    cd "$SCRIPT_DIR"

    # Set default DATABASE_URL if not set
    export DATABASE_URL="${DATABASE_URL:-$DEFAULT_DB_URL}"

    echo "Running migrations..."
    echo "Database: $DATABASE_URL"
    echo ""

    # Check if uv is available
    if command -v uv &> /dev/null; then
        uv run python migrate.py "$@"
    elif command -v python3 &> /dev/null; then
        python3 migrate.py "$@"
    else
        python migrate.py "$@"
    fi
}

# Parse arguments
USE_DOCKER=false
EXTRA_ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --docker)
            USE_DOCKER=true
            shift
            ;;
        *)
            EXTRA_ARGS+=("$1")
            shift
            ;;
    esac
done

if [ "$USE_DOCKER" = true ]; then
    run_in_docker "${EXTRA_ARGS[@]}"
else
    run_locally "${EXTRA_ARGS[@]}"
fi

