#!/usr/bin/env python3
"""
Database migration script for Budget Tracker.

This script runs Alembic migrations on the database specified by the
DATABASE_URL environment variable. It can be run both locally and in
production environments (e.g., on a NAS).

Usage:
    # Run migrations locally
    uv run python migrate.py

    # Run migrations with a specific database URL
    DATABASE_URL=sqlite:///path/to/db.sqlite uv run python migrate.py

    # Show current migration status
    uv run python migrate.py --status

    # Downgrade one revision
    uv run python migrate.py --downgrade

    # Upgrade to a specific revision
    uv run python migrate.py --revision <revision_id>
"""

import argparse
import os
import sys

# Add src to path so alembic can find app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from alembic import command
from alembic.config import Config


def get_alembic_config():
    """Get Alembic configuration."""
    # Get the directory containing this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    alembic_ini = os.path.join(script_dir, "alembic.ini")

    if not os.path.exists(alembic_ini):
        print(f"Error: alembic.ini not found at {alembic_ini}")
        sys.exit(1)

    config = Config(alembic_ini)

    # Set the script location relative to the ini file
    config.set_main_option("script_location", os.path.join(script_dir, "alembic"))

    return config


def run_migrations(revision="head"):
    """Run database migrations up to the specified revision."""
    config = get_alembic_config()

    db_url = os.getenv("DATABASE_URL", "sqlite:///./budget_tracker.db")
    print(f"Running migrations on database: {db_url}")

    try:
        command.upgrade(config, revision)
        print(f"Successfully migrated to revision: {revision}")
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)


def downgrade(revision="-1"):
    """Downgrade database to a previous revision."""
    config = get_alembic_config()

    db_url = os.getenv("DATABASE_URL", "sqlite:///./budget_tracker.db")
    print(f"Downgrading database: {db_url}")

    try:
        command.downgrade(config, revision)
        print(f"Successfully downgraded to revision: {revision}")
    except Exception as e:
        print(f"Downgrade failed: {e}")
        sys.exit(1)


def show_status():
    """Show current migration status."""
    config = get_alembic_config()

    db_url = os.getenv("DATABASE_URL", "sqlite:///./budget_tracker.db")
    print(f"Checking migration status for database: {db_url}")
    print()

    try:
        command.current(config, verbose=True)
    except Exception as e:
        print(f"Error checking status: {e}")
        sys.exit(1)


def stamp_head():
    """
    Stamp the database with the current head revision without running migrations.
    Use this for existing databases that already have the current schema.
    """
    config = get_alembic_config()

    db_url = os.getenv("DATABASE_URL", "sqlite:///./budget_tracker.db")
    print(f"Stamping database as current head: {db_url}")

    try:
        command.stamp(config, "head")
        print("Successfully stamped database with current head revision")
    except Exception as e:
        print(f"Stamping failed: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Run database migrations for Budget Tracker",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    group = parser.add_mutually_exclusive_group()
    group.add_argument("--status", action="store_true", help="Show current migration status")
    group.add_argument("--downgrade", action="store_true", help="Downgrade one revision")
    group.add_argument("--revision", type=str, help="Upgrade to a specific revision (default: head)")
    group.add_argument(
        "--stamp-head", action="store_true", help="Stamp database with head revision (for existing databases)"
    )

    args = parser.parse_args()

    if args.status:
        show_status()
    elif args.downgrade:
        downgrade()
    elif args.stamp_head:
        stamp_head()
    elif args.revision:
        run_migrations(args.revision)
    else:
        run_migrations()


if __name__ == "__main__":
    main()
