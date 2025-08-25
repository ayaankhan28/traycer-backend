from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uvicorn
from datetime import datetime
import random

app = FastAPI(title="Mock API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Mock FastAPI", "timestamp": datetime.now()}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "uptime": random.randint(100, 999)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

