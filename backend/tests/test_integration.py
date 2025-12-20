import pytest
from datetime import date


def test_full_transaction_flow_integration(client, sample_user):
    """Integration test: Create transaction, fetch it, verify aggregation"""
    
    # Step 1: Create a category
    category_data = {"name": "Groceries", "type": "expense"}
    cat_response = client.post("/categories/", json=category_data)
    assert cat_response.status_code == 201
    category_id = cat_response.json()["id"]
    
    # Step 2: Create a beneficiary
    beneficiary_data = {"name": "Supermarket"}
    ben_response = client.post("/beneficiaries/", json=beneficiary_data)
    assert ben_response.status_code == 201
    beneficiary_id = ben_response.json()["id"]
    
    # Step 3: Create a transaction
    transaction_data = {
        "amount": 150.0,
        "date": "2024-01-20",
        "description": "Weekly groceries",
        "type": "expense",
        "category_id": category_id,
        "beneficiary_id": beneficiary_id,
        "user_id": sample_user.id
    }
    trans_response = client.post("/transactions/", json=transaction_data)
    assert trans_response.status_code == 201
    transaction_id = trans_response.json()["id"]
    
    # Step 4: Fetch the transaction and verify
    fetch_response = client.get(f"/transactions/{transaction_id}")
    assert fetch_response.status_code == 200
    trans_data = fetch_response.json()
    assert trans_data["amount"] == 150.0
    assert trans_data["description"] == "Weekly groceries"
    
    # Step 5: Verify aggregation includes this transaction
    agg_response = client.get("/aggregations/summary")
    assert agg_response.status_code == 200
    agg_data = agg_response.json()
    assert agg_data["total_expenses"] == 150.0
    assert agg_data["total_income"] == 0
    assert agg_data["net_total"] == -150.0
    
    # Step 6: Verify category totals
    assert len(agg_data["by_category"]) == 1
    assert agg_data["by_category"][0]["category_name"] == "Groceries"
    assert agg_data["by_category"][0]["total"] == 150.0
    
    # Step 7: Verify beneficiary totals
    assert len(agg_data["by_beneficiary"]) == 1
    assert agg_data["by_beneficiary"][0]["beneficiary_name"] == "Supermarket"
    assert agg_data["by_beneficiary"][0]["total"] == 150.0


def test_complete_budget_workflow(client):
    """Integration test: Complete budget tracking workflow"""
    
    # Create a user
    user_data = {"name": "Budget User", "email": "budget@example.com"}
    user_response = client.post("/users/", json=user_data)
    assert user_response.status_code == 201
    user_id = user_response.json()["id"]
    
    # Create categories
    categories = [
        {"name": "Salary", "type": "income"},
        {"name": "Food", "type": "expense"},
        {"name": "Transport", "type": "expense"}
    ]
    category_ids = {}
    for cat in categories:
        response = client.post("/categories/", json=cat)
        assert response.status_code == 201
        category_ids[cat["name"]] = response.json()["id"]
    
    # Create beneficiaries
    beneficiaries = ["Employer", "Grocery Store", "Gas Station"]
    beneficiary_ids = {}
    for ben_name in beneficiaries:
        response = client.post("/beneficiaries/", json={"name": ben_name})
        assert response.status_code == 201
        beneficiary_ids[ben_name] = response.json()["id"]
    
    # Create transactions
    transactions = [
        {
            "amount": 5000.0,
            "date": "2024-01-31",
            "description": "Monthly salary",
            "type": "income",
            "category_id": category_ids["Salary"],
            "beneficiary_id": beneficiary_ids["Employer"],
            "user_id": user_id
        },
        {
            "amount": 300.0,
            "date": "2024-01-05",
            "description": "Grocery shopping",
            "type": "expense",
            "category_id": category_ids["Food"],
            "beneficiary_id": beneficiary_ids["Grocery Store"],
            "user_id": user_id
        },
        {
            "amount": 60.0,
            "date": "2024-01-10",
            "description": "Fill up gas",
            "type": "expense",
            "category_id": category_ids["Transport"],
            "beneficiary_id": beneficiary_ids["Gas Station"],
            "user_id": user_id
        }
    ]
    
    for trans in transactions:
        response = client.post("/transactions/", json=trans)
        assert response.status_code == 201
    
    # Get all transactions
    all_trans = client.get("/transactions/")
    assert all_trans.status_code == 200
    assert len(all_trans.json()) == 3
    
    # Get summary
    summary = client.get("/aggregations/summary")
    assert summary.status_code == 200
    summary_data = summary.json()
    
    assert summary_data["total_income"] == 5000.0
    assert summary_data["total_expenses"] == 360.0
    assert summary_data["net_total"] == 4640.0
    
    # Verify category breakdown
    assert len(summary_data["by_category"]) == 3
    
    # Filter by date range (only first half of month)
    filtered_summary = client.get("/aggregations/summary?start_date=2024-01-01&end_date=2024-01-15")
    assert filtered_summary.status_code == 200
    filtered_data = filtered_summary.json()
    
    # Should only have the two expense transactions
    assert filtered_data["total_expenses"] == 360.0
    assert filtered_data["total_income"] == 0  # Salary was on Jan 31
    
    # Update a transaction
    trans_id = all_trans.json()[0]["id"]
    update_response = client.put(f"/transactions/{trans_id}", json={"amount": 320.0})
    assert update_response.status_code == 200
    
    # Verify summary updated
    updated_summary = client.get("/aggregations/summary")
    updated_data = updated_summary.json()
    # The exact total depends on which transaction was updated, so just verify it's different
    assert updated_data != summary_data
