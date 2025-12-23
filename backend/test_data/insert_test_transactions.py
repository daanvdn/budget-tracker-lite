"""
Script to insert test transactions from a JSONL file into the database via the API.

This script will:
1. Create the required categories (food, clothes, gifts, gaming, books)
2. Create the required beneficiaries (Tom, Sally, Freddy)
3. Insert all transactions from the JSONL file

Usage:
    cd backend
    python test_data/insert_test_transactions.py

Or with a custom file:
    python test_data/insert_test_transactions.py --file path/to/transactions.jsonl

Or with a custom API URL:
    python test_data/insert_test_transactions.py --api-url http://localhost:8000/api
"""

import argparse
import json
import sys
import traceback
from pathlib import Path

import httpx

# Predefined categories and beneficiaries
CATEGORIES = [
    {"id": 1, "name": "food"},
    {"id": 2, "name": "clothes"},
    {"id": 3, "name": "gifts"},
    {"id": 4, "name": "gaming"},
    {"id": 5, "name": "books"},
]

BENEFICIARIES = [
    {"id": 1, "name": "Tom"},
    {"id": 2, "name": "Sally"},
    {"id": 3, "name": "Freddy"},
]


def load_transactions(jsonl_file: Path) -> list[dict]:
    """Load transactions from a JSONL file."""
    transactions = []
    with open(jsonl_file, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if line:
                try:
                    transactions.append(json.loads(line))
                except json.JSONDecodeError as e:
                    print(f"Warning: Skipping invalid JSON on line {line_num}: {e}")
    return transactions


def insert_category(client: httpx.Client, api_url: str, category: dict) -> dict | None:
    """Insert a single category via the API."""
    url = f"{api_url}/categories"
    try:
        response = client.post(url, json={"name": category["name"]})
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 400:
            # Category might already exist
            print(f"  Category '{category['name']}' may already exist: {e.response.text}")
            return None
        print(f"HTTP error inserting category: {e.response.status_code} - {e.response.text}")
        return None
    except httpx.RequestError as e:
        print(f"Request error inserting category: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error inserting category: {e}")
        traceback.print_exc()


def insert_beneficiary(client: httpx.Client, api_url: str, beneficiary: dict) -> dict | None:
    """Insert a single beneficiary via the API."""
    url = f"{api_url}/beneficiaries"
    try:
        response = client.post(url, json={"name": beneficiary["name"]})
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 400:
            # Beneficiary might already exist
            print(f"  Beneficiary '{beneficiary['name']}' may already exist: {e.response.text}")
            return None
        print(f"HTTP error inserting beneficiary: {e.response.status_code} - {e.response.text}")
        return None
    except httpx.RequestError as e:
        print(f"Request error inserting beneficiary: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error inserting beneficiary: {e}")
        traceback.print_exc()


def insert_transaction(client: httpx.Client, api_url: str, transaction: dict) -> dict | None:
    """Insert a single transaction via the API."""
    url = f"{api_url}/transactions"
    try:
        response = client.post(url, json=transaction)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        print(f"HTTP error inserting transaction: {e.response.status_code} - {e.response.text}")
        return None
    except httpx.RequestError as e:
        print(f"Request error inserting transaction: {e}")
        return None

    except Exception as e:
        print(f"Unexpected error inserting transaction: {e}")
        # print traceback
        traceback.print_exc()
        return None


def main():
    parser = argparse.ArgumentParser(description="Insert test data (categories, beneficiaries, transactions) via API")
    parser.add_argument(
        "--file",
        type=Path,
        default=Path(__file__).parent / "test_transactions.jsonl",
        help="Path to the JSONL file containing transactions (default: test_transactions.jsonl)",
    )
    parser.add_argument(
        "--api-url",
        type=str,
        default="http://localhost:8000/api",
        help="Base API URL (default: http://localhost:8000/api)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only load and validate data without inserting",
    )
    parser.add_argument(
        "--skip-setup",
        action="store_true",
        default=False,
        help="Skip creating categories and beneficiaries (use if they already exist)",
    )

    args = parser.parse_args()

    # Check if file exists
    if not args.file.exists():
        print(f"Error: File not found: {args.file}")
        sys.exit(1)

    # Load transactions
    print(f"Loading transactions from: {args.file}")
    transactions = load_transactions(args.file)
    print(f"Loaded {len(transactions)} transactions")

    if args.dry_run:
        print("\n--- DRY RUN MODE ---")
        print("\nCategories to create:")
        for c in CATEGORIES:
            print(f"  {c['id']}. {c['name']}")
        print("\nBeneficiaries to create:")
        for b in BENEFICIARIES:
            print(f"  {b['id']}. {b['name']}")
        print("\nTransactions that would be inserted:")
        for i, t in enumerate(transactions, 1):
            print(f"  {i}. {t['description']} - ${t['amount']:.2f} ({t['type']})")
        print(f"\nTotal: {len(transactions)} transactions")
        return

    with httpx.Client(timeout=30.0) as client:
        # Step 1: Create categories
        if not args.skip_setup:
            print(f"\n{'=' * 60}")
            print("Step 1: Creating categories...")
            print("=" * 60)
            for category in CATEGORIES:
                result = insert_category(client, args.api_url, category)
                if result:
                    print(f"  ✓ Created category: {category['name']}")

            # Step 2: Create beneficiaries
            print(f"\n{'=' * 60}")
            print("Step 2: Creating beneficiaries...")
            print("=" * 60)
            for beneficiary in BENEFICIARIES:
                result = insert_beneficiary(client, args.api_url, beneficiary)
                if result:
                    print(f"  ✓ Created beneficiary: {beneficiary['name']}")

        # Step 3: Insert transactions
        print(f"\n{'=' * 60}")
        print("Step 3: Inserting transactions...")
        print("=" * 60)

        success_count = 0
        error_count = 0

        for i, transaction in enumerate(transactions, 1):
            result = insert_transaction(client, args.api_url, transaction)
            if result:
                success_count += 1
                desc = transaction["description"]
                amt = transaction["amount"]
                print(f"[{i}/{len(transactions)}] ✓ Created: {desc} - ${amt:.2f}")
            else:
                error_count += 1
                print(f"[{i}/{len(transactions)}] ✗ Failed: {transaction['description']}")

    print(f"\n{'=' * 60}")
    print(f"Done! Inserted {success_count} transactions, {error_count} errors")
    print("=" * 60)


if __name__ == "__main__":
    main()
