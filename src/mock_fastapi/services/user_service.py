from typing import List, Optional
from ..database.connection import get_db_connection
from ..models.user import UserCreate, UserUpdate

class UserService:
    
    @staticmethod
    async def get_all_users() -> List[dict]:
        """Get all users from database"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users")
            users = cursor.fetchall()
            
            return [
                {
                    "id": user[0],
                    "name": user[1],
                    "email": user[2],
                    "age": user[3],
                    "created_at": user[4]
                }
                for user in users
            ]
    
    @staticmethod
    async def get_user_by_id(user_id: int) -> Optional[dict]:
        """Get user by ID"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            
            if user:
                return {
                    "id": user[0],
                    "name": user[1],
                    "email": user[2],
                    "age": user[3],
                    "created_at": user[4]
                }
            return None
    
    @staticmethod
    async def create_user(user_data: UserCreate) -> dict:
        """Create a new user"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
                (user_data.name, user_data.email, user_data.age)
            )
            conn.commit()
            
            user_id = cursor.lastrowid
            return {
                "id": user_id,
                "name": user_data.name,
                "email": user_data.email,
                "age": user_data.age
            }
