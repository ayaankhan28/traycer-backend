from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class ProductBase(BaseModel):
    name: str
    price: Decimal
    category: str
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    stock: int = 0
    
    class Config:
        from_attributes = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[Decimal] = None
    category: Optional[str] = None
    description: Optional[str] = None
    stock: Optional[int] = None
