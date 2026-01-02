#!/usr/bin/env python3
"""
Auto-migration script for Docker container startup.

This script handles the migration logic for both new and existing databases:
1. For new databases: runs all migrations
2. For existing databases without alembic tracking: stamps the current state, then migrates
3. For databases with alembic tracking: runs any pending migrations
"""

import os
import sqlite3
import subprocess
import sys

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from app.config.settings import settings


def get_db_path() -> str:
    """Extract the database file path from the DATABASE_URL."""
    url = settings.DATABASE_URL
    # Handle both sync and async URLs
    for prefix in ["sqlite+aiosqlite:///", "sqlite:///"]:
        if url.startswith(prefix):
            return url[len(prefix) :]
    return url


def check_database_state(db_path: str) -> str:
    """
    Check the state of the database.

    Returns:
        'new' - Database doesn't exist
        'stamp' - Database exists but no alembic tracking (needs stamping)
        'migrate' - Database has alembic tracking (normal migration)
    """
    if not os.path.exists(db_path):
        return "new"

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if alembic_version table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='alembic_version'")
        has_alembic = cursor.fetchone() is not None

        # Check if transactions table exists (indicates existing database)
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'")
        has_transactions = cursor.fetchone() is not None

        # Check if notes column already exists in transactions table
        has_notes_column = False
        if has_transactions:
            cursor.execute("PRAGMA table_info(transactions)")
            columns = [row[1] for row in cursor.fetchall()]
            has_notes_column = "notes" in columns

        if has_transactions and not has_alembic:
            # Existing database without alembic - need to stamp
            # If notes column exists, stamp at head; otherwise stamp at base
            if has_notes_column:
                return "stamp_head"
            return "stamp_base"

        return "migrate"
    finally:
        conn.close()


def run_command(cmd: list[str]) -> int:
    """Run a command and return the exit code."""
    print(f"Running: {' '.join(cmd)}")
    return subprocess.call(cmd)


def main():
    print("=== Database Migration Check ===")

    db_path = get_db_path()
    print(f"Database path: {db_path}")

    state = check_database_state(db_path)
    print(f"Database state: {state}")

    if state == "stamp_base":
        # Existing database without alembic tracking and without new columns
        # We need to stamp it at the revision BEFORE our migration
        print("Existing database detected without migration tracking.")
        print("Stamping at base (before notes/tags migration)...")
        # Stamp with an empty base - alembic will then apply all migrations
        # But since the schema already exists (except notes/tags), we need to be careful
        # Actually, we should stamp at 'base' which means "no migrations applied"
        # Then upgrade will try to apply our migration which adds notes/tags
        result = run_command(["uv", "run", "alembic", "stamp", "base"])
        if result != 0:
            print("Warning: Failed to stamp database, continuing anyway...")

    elif state == "stamp_head":
        # Database already has the notes column, stamp at head
        print("Database already has latest schema. Stamping at head...")
        result = run_command(["uv", "run", "alembic", "stamp", "head"])
        if result != 0:
            print("Warning: Failed to stamp database, continuing anyway...")

    # Run migrations (this is safe to run even if already up to date)
    print("Running migrations...")
    result = run_command(["uv", "run", "alembic", "upgrade", "head"])

    if result != 0:
        print("ERROR: Migration failed!")
        sys.exit(1)

    print("=== Migrations complete ===")


if __name__ == "__main__":
    main()
