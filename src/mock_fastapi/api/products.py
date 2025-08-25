from fastapi import APIRouter, HTTPException
from typing import List
import random

router = APIRouter(prefix="/products", tags=["products"])

mock_products = [
    {"id": 1, "name": "Laptop", "price": 999.99, "category": "Electronics"},
    {"id": 2, "name": "Coffee Mug", "price": 12.50, "category": "Kitchen"},
    {"id": 3, "name": "Running Shoes", "price": 89.99, "category": "Sports"}
]

@router.get("/", response_model=List[dict])
async def get_products():
    return mock_products

@router.get("/{product_id}")
async def get_product(product_id: int):
    product = next((p for p in mock_products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/category/{category}")
async def get_products_by_category(category: str):
    filtered = [p for p in mock_products if p["category"].lower() == category.lower()]
    return filtered
