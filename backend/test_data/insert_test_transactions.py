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
import time
import traceback
from pathlib import Path

import httpx

# Predefined categories and beneficiaries
CATEGORIES = [
    {"id": 1, "name": "food", "type": "expense"},
    {"id": 2, "name": "clothes", "type": "expense"},
    {"id": 3, "name": "gifts", "type": "both"},
    {"id": 4, "name": "gaming", "type": "expense"},
    {"id": 5, "name": "books", "type": "expense"},
]

BENEFICIARIES = [
    {"id": 1, "name": "Tom"},
    {"id": 2, "name": "Sally"},
    {"id": 3, "name": "Freddy"},
]

USERS = [
    {"id": 1, "name": "Test User"},
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


def register_user(client: httpx.Client, api_url: str, name: str, email: str, password: str) -> dict | None:
    """Register a new user via auth/register. If the user exists, returns the response or None.

    Returns the JSON response if successful or None on fatal error. If user already exists (400), the response JSON
    will be returned.
    """
    url = f"{api_url}/auth/register"
    payload = {"name": name, "email": email, "password": password}
    try:
        response = client.post(url, json=payload)
        # If already exists, backend may return 400 with message; we'll let caller handle login attempt.
        response.raise_for_status()
        print(f"Registered user: {email}")
        return response.json()
    except httpx.HTTPStatusError as e:
        # If user already exists, print and continue; return the response JSON if available
        status = e.response.status_code
        text = e.response.text
        if status == 400:
            print(f"Register returned 400 (possibly already registered): {text}")
            try:
                return e.response.json()
            except Exception:
                return None
        print(f"HTTP error registering user: {status} - {text}")
        return None
    except httpx.RequestError as e:
        print(f"Request error registering user: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error registering user: {e}")
        traceback.print_exc()
        return None


def login_user(client: httpx.Client, api_url: str, email: str, password: str) -> str | None:
    """Login and return the access token (string) or None on failure."""
    url = f"{api_url}/auth/login"
    payload = {"email": email, "password": password}
    try:
        response = client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        token = data.get("access_token")
        if not token:
            print("Login succeeded but no access_token in response")
            return None
        print(f"Logged in as {email}")
        return token
    except httpx.HTTPStatusError as e:
        print(f"HTTP error logging in: {e.response.status_code} - {e.response.text}")
        return None
    except httpx.RequestError as e:
        print(f"Request error logging in: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error logging in: {e}")
        traceback.print_exc()
        return None


def insert_category(client: httpx.Client, api_url: str, category: dict) -> dict | None:
    """Insert a single category via the API."""
    url = f"{api_url}/categories"
    try:
        response = client.post(url, json={"name": category["name"], "type": category["type"]})
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 400 or e.response.status_code == 409:
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
        if e.response.status_code in (400, 409, 500):
            # Beneficiary might already exist (500 = unique constraint violation)
            print(f"  Beneficiary '{beneficiary['name']}' may already exist (status {e.response.status_code})")
            return {"skipped": True}  # Return non-None to indicate it's OK to continue
        print(f"HTTP error inserting beneficiary: {e.response.status_code} - {e.response.text}")
        return None
    except httpx.RequestError as e:
        print(f"Request error inserting beneficiary: {e}")
        return {"skipped": True}  # Connection error after 500 is expected, continue
    except Exception as e:
        print(f"Unexpected error inserting beneficiary: {e}")
        traceback.print_exc()
        return None


def insert_user(client: httpx.Client, api_url: str, user: dict) -> dict | None:
    """Insert a single user via the API."""
    url = f"{api_url}/users"
    try:
        response = client.post(url, json={"name": user["name"]})
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code in (400, 409, 500):
            # User might already exist (500 = unique constraint violation)
            print(f"  User '{user['name']}' may already exist (status {e.response.status_code})")
            return {"skipped": True}  # Return non-None to indicate it's OK to continue
        print(f"HTTP error inserting user: {e.response.status_code} - {e.response.text}")
        return None
    except httpx.RequestError as e:
        print(f"Request error inserting user: {e}")
        return {"skipped": True}  # Connection error after 500 is expected, continue
    except Exception as e:
        print(f"Unexpected error inserting user: {e}")
        traceback.print_exc()
        return None


def insert_transaction(client: httpx.Client, api_url: str, transaction: dict, max_retries: int = 3) -> dict | None:
    """Insert a single transaction via the API with retry logic."""
    url = f"{api_url}/transactions"

    for attempt in range(max_retries):
        try:
            response = client.post(url, json=transaction)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            print(f"HTTP error inserting transaction: {e.response.status_code} - {e.response.text}")
            return None
        except httpx.RequestError as e:
            if attempt < max_retries - 1:
                print(f"  Connection error (attempt {attempt + 1}/{max_retries}), retrying...")
                time.sleep(0.5)  # Brief pause before retry
                continue
            print(f"Request error inserting transaction: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error inserting transaction: {e}")
            traceback.print_exc()
            return None

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

    # Credentials to register/login
    TEST_USER_NAME = "<change me>"
    TEST_USER_EMAIL = "<change me>"
    TEST_USER_PASSWORD = "<change me>"

    if "<change me>" in (TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD):
        print("Error: Please set TEST_USER_NAME, TEST_USER_EMAIL, and TEST_USER_PASSWORD in the script before running.")
        sys.exit(1)

    def _adjust_password(pwd: str) -> str:
        """Make a minimal modification to satisfy password rules: length>=8, has digit, has uppercase."""
        new_pwd = pwd
        if len(new_pwd) < 8:
            new_pwd = (new_pwd + "A1") * ((8 // (len(new_pwd) + 2)) + 1)
            new_pwd = new_pwd[: max(8, len(new_pwd))]
        # Ensure at least one digit
        if not any(ch.isdigit() for ch in new_pwd):
            new_pwd = new_pwd + "1"
        # Ensure at least one uppercase
        if not any(ch.isupper() for ch in new_pwd):
            # capitalize first letter of local-part (before @) if an email, else just uppercase first char
            if "@" in new_pwd:
                local, _, domain = new_pwd.partition("@")
                if local:
                    local = local[0].upper() + local[1:]
                    new_pwd = local + ("@" + domain if domain else "")
                else:
                    new_pwd = new_pwd.capitalize()
            else:
                new_pwd = new_pwd[0].upper() + new_pwd[1:]
        return new_pwd

    with httpx.Client(timeout=30.0) as client:
        # Try login first. If login fails, attempt register, and if that fails due to password policy,
        # make a minimal adjusted password and retry registration/login.
        print(f"\n{'=' * 60}")
        print("Authentication: attempting to login/register test user...")
        print(f"Using email: {TEST_USER_EMAIL}")

        token = login_user(client, args.api_url, TEST_USER_EMAIL, TEST_USER_PASSWORD)
        used_password = TEST_USER_PASSWORD

        if not token:
            print("Initial login failed; attempting to register user with provided password...")
            reg = register_user(client, args.api_url, TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD)

            # If registration likely failed due to password strength, adjust and retry
            reg_failed_due_to_password = False
            if isinstance(reg, dict) and reg.get("detail") and isinstance(reg.get("detail"), str):
                detail = reg.get("detail")
                if "Password" in detail or "password" in detail or "uppercase" in detail or "number" in detail:
                    reg_failed_due_to_password = True

            if reg_failed_due_to_password or reg is None:
                adjusted = _adjust_password(TEST_USER_PASSWORD)
                if adjusted != TEST_USER_PASSWORD:
                    print(f"Registration failed due to password policy; retrying with adjusted password: {adjusted}")
                    reg2 = register_user(client, args.api_url, TEST_USER_NAME, TEST_USER_EMAIL, adjusted)
                    if reg2 is not None:
                        used_password = adjusted
                    else:
                        print("Registration retry failed; continuing to attempt login with adjusted password")
                        used_password = adjusted
                else:
                    print("Could not auto-adjust password; registration failed")

            # Attempt login with the password that we used (either original or adjusted)
            token = login_user(client, args.api_url, TEST_USER_EMAIL, used_password)

        if not token:
            print("Failed to obtain access token. Exiting.")
            sys.exit(1)

        # Set Authorization header for subsequent requests
        client.headers.update({"Authorization": f"Bearer {token}"})

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
                if result and "skipped" not in result:
                    print(f"  ✓ Created beneficiary: {beneficiary['name']}")

            # Brief pause to let backend recover from any 500 errors
            time.sleep(1.0)

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
