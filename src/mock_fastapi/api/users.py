from fastapi import APIRouter, HTTPException
from typing import List
import random

router = APIRouter(prefix="/users", tags=["users"])

mock_users = [
    {"id": 1, "name": "John Doe", "email": "john@example.com", "age": 28},
    {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "age": 32},
    {"id": 3, "name": "Bob Johnson", "email": "bob@example.com", "age": 25}
]

@router.get("/", response_model=List[dict])
async def get_users():
    return mock_users

@router.get("/{user_id}")
async def get_user(user_id: int):
    user = next((u for u in mock_users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/")
async def create_user(name: str, email: str, age: int):
    new_id = max(u["id"] for u in mock_users) + 1
    user = {"id": new_id, "name": name, "email": email, "age": age}
    mock_users.append(user)
    return user
