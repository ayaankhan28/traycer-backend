from .connection import get_db_connection, init_db

def seed_users():
    """Seed users table with sample data"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        users_data = [
            ("Alice Johnson", "alice@example.com", 29),
            ("Bob Wilson", "bob@example.com", 34),
            ("Carol Davis", "carol@example.com", 27),
            ("David Brown", "david@example.com", 31),
            ("Eva Miller", "eva@example.com", 26)
        ]
        
        cursor.executemany(
            "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
            users_data
        )
        conn.commit()

def seed_products():
    """Seed products table with sample data"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        products_data = [
            ("Gaming Mouse", 59.99, "Electronics", "High-precision gaming mouse", 15),
            ("Yoga Mat", 24.99, "Sports", "Non-slip yoga mat", 30),
            ("Coffee Maker", 89.99, "Kitchen", "Automatic coffee maker", 8),
            ("Running Shorts", 34.99, "Sports", "Lightweight running shorts", 25),
            ("Bluetooth Speaker", 79.99, "Electronics", "Portable speaker", 12)
        ]
        
        cursor.executemany(
            "INSERT INTO products (name, price, category, description, stock) VALUES (?, ?, ?, ?, ?)",
            products_data
        )
        conn.commit()

def run_seeds():
    """Run all seed functions"""
    init_db()
    seed_users()
    seed_products()
    print("Database seeded successfully!")
